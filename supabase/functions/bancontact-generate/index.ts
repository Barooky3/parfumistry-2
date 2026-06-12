// Bancontact fake order generator. Creates a row in bancontact_orders and
// emails an approval message to elkhabirmalik with Approve / Reject / Split 50/50 links.
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.1";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const RECIPIENT = "elkhabirmalik@gmail.com";

interface BancItem {
  name: string;
  brand: string;
  price: number;
  quantity: number;
  selectedMl?: number;
}

function escapeHtml(text: string): string {
  return String(text)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function genToken(): string {
  const arr = new Uint8Array(32);
  crypto.getRandomValues(arr);
  return Array.from(arr, (b) => b.toString(16).padStart(2, "0")).join("");
}

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function buildEmailHtml(
  orderId: string,
  token: string,
  customerName: string,
  customerEmail: string,
  country: string | null,
  items: BancItem[],
  totalAmount: number,
  baseUrl: string,
): string {
  const approveUrl = `${baseUrl}/functions/v1/bancontact-action?id=${orderId}&token=${token}&action=approve`;
  const rejectUrl  = `${baseUrl}/functions/v1/bancontact-action?id=${orderId}&token=${token}&action=reject`;
  const splitUrl   = `${baseUrl}/functions/v1/bancontact-action?id=${orderId}&token=${token}&action=split`;

  const itemRows = items.map((item) => {
    const mlLabel = item.selectedMl ? ` — ${item.selectedMl}ml` : "";
    return `<tr><td style="padding:8px 0;border-bottom:1px solid #eee;font-family:Arial,sans-serif;">
      <strong>${escapeHtml(item.brand)}</strong> — ${escapeHtml(item.name)}${mlLabel}<br/>
      <span style="color:#666;">Qty: ${item.quantity} · €${(item.price * item.quantity).toFixed(2)}</span>
    </td></tr>`;
  }).join("");

  const countryRow = country
    ? `<tr><td style="padding:4px 0;color:#999;width:120px;">Country:</td><td style="padding:4px 0;">${escapeHtml(country)}</td></tr>`
    : "";

  return `<!DOCTYPE html><html><head><meta charset="utf-8"></head>
<body style="margin:0;padding:20px;background:#f4f3ef;font-family:Arial,sans-serif;">
<div style="max-width:600px;margin:0 auto;background:#fff;border-radius:8px;overflow:hidden;">
  <div style="background:#1a1a1a;padding:24px;text-align:center;">
    <h1 style="color:#c9a96e;font-size:22px;margin:0;letter-spacing:3px;">BANCONTACT ORDER APPROVAL</h1>
  </div>
  <div style="padding:24px;">
    <p style="font-size:15px;color:#333;margin:0 0 16px;">A new Bancontact order needs your approval.</p>
    <table style="width:100%;margin-bottom:16px;font-size:14px;">
      <tr><td style="padding:4px 0;color:#999;width:120px;">Customer:</td><td style="padding:4px 0;"><strong>${escapeHtml(customerName)}</strong></td></tr>
      <tr><td style="padding:4px 0;color:#999;">Email:</td><td style="padding:4px 0;">${escapeHtml(customerEmail)}</td></tr>
      ${countryRow}
      <tr><td style="padding:4px 0;color:#999;">Total:</td><td style="padding:4px 0;"><strong>€${totalAmount.toFixed(2)}</strong></td></tr>
    </table>
    <div style="text-align:center;margin-top:24px;margin-bottom:12px;">
      <a href="${approveUrl}" style="display:inline-block;background:#16a34a;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;margin:4px;">Approve</a>
      <a href="${rejectUrl}" style="display:inline-block;background:#dc2626;color:#fff;padding:14px 28px;border-radius:6px;text-decoration:none;font-weight:600;font-size:15px;margin:4px;">Reject</a>
    </div>
    <div style="text-align:center;margin-bottom:16px;">
      <a href="${splitUrl}" style="display:inline-block;background:#7c3aed;color:#fff;padding:12px 26px;border-radius:6px;text-decoration:none;font-weight:600;font-size:14px;">Split 50/50 (half now, half in 1h)</a>
    </div>
    <div style="border-top:2px solid #1a1a1a;padding-top:12px;margin-bottom:16px;">
      <div style="font-size:11px;text-transform:uppercase;letter-spacing:2px;color:#999;margin-bottom:8px;">Order Items</div>
      <table style="width:100%;">${itemRows}</table>
    </div>
  </div>
</div>
</body></html>`;
}

async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  if (!apiKey) throw new Error("RESEND_API_KEY not configured");
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: "Parfumistry Bancontact <orders@parfumistry.net>",
      to: [to],
      subject,
      html,
    }),
  });
  if (!res.ok) {
    const errBody = await res.text();
    throw new Error(`Resend API error (${res.status}): ${errBody}`);
  }
}

// Seed customer pool — taken from a real orders export. The bancontact
// generator picks exclusively from this list (NOT from the live orders
// table) so that the same vetted set of names/countries rotates through.
// Cycle behavior: pick from the customer(s) with the fewest prior bancontact
// uses. Once everyone has been used N times, the pool naturally jumbles and
// reuses (random pick among the new min-count tier).
const SEED_CUSTOMERS: Array<{ name: string; email: string; country: string; city: string }> = [
  { name: "Maria Wright", email: "angela41@example.com", country: "CH", city: "Andrewtown" },
  { name: "Sheila Taylor", email: "cbest@example.com", country: "US", city: "Lake William" },
  { name: "Sandra Johnson", email: "brookscheyenne@example.org", country: "NL", city: "Lopezland" },
  { name: "Brent Mcconnell", email: "joshua51@example.org", country: "ES", city: "Victorfurt" },
  { name: "Shannon Pham", email: "williamskaren@example.com", country: "NL", city: "Walkerview" },
  { name: "Stephanie Obrien", email: "sheilahardin@example.com", country: "FR", city: "South Samantha" },
  { name: "Regina Smith", email: "wmontgomery@example.org", country: "NL", city: "Port Caitlin" },
  { name: "Daniel Duke", email: "scottcoleman@example.net", country: "AT", city: "Phillipsville" },
  { name: "Michael Hunt", email: "mario70@example.net", country: "SE", city: "New Lisa" },
  { name: "Jennifer Banks", email: "dstark@example.com", country: "DE", city: "Vickistad" },
  { name: "Robert Duran", email: "kristahunter@example.org", country: "DK", city: "Johnsonville" },
  { name: "Kimberly Dillon", email: "kgonzalez@example.org", country: "IE", city: "South Allison" },
  { name: "Megan Guerra", email: "riggsjoseph@example.com", country: "ES", city: "Matthewville" },
  { name: "Jill Montgomery", email: "dwaynestevens@example.com", country: "IT", city: "New Kenneth" },
  { name: "Michael Maxwell", email: "michael19@example.org", country: "ES", city: "Millertown" },
  { name: "Nathaniel Mack", email: "melissa43@example.org", country: "DE", city: "Lake Anthonymouth" },
  { name: "Jordan Lane", email: "bakercindy@example.net", country: "CH", city: "East Vanessaside" },
  { name: "Robert Garcia", email: "zacharywilson@example.net", country: "CA", city: "Lloydton" },
  { name: "Jordan Hardy", email: "mmcfarland@example.org", country: "IE", city: "Coltonside" },
  { name: "Pamela Gomez", email: "wperry@example.net", country: "AT", city: "Williamsshire" },
  { name: "Lucas Zuniga", email: "ibennett@example.net", country: "AT", city: "New Brandon" },
  { name: "Brandy Hamilton", email: "lisa06@example.org", country: "IT", city: "Johnsonstad" },
  { name: "Heather Thomas", email: "lewiskyle@example.net", country: "CH", city: "Colefort" },
  { name: "Misty Walker", email: "andersonjennifer@example.net", country: "NO", city: "Jonathanport" },
  { name: "Javier Baker", email: "johnsonmackenzie@example.org", country: "GB", city: "New Melissa" },
  { name: "Frederick Shaw", email: "sharonalexander@example.org", country: "SE", city: "East Patrickport" },
  { name: "Michelle Ward MD", email: "shenderson@example.org", country: "AU", city: "Loganberg" },
  { name: "Anthony Watson", email: "edwardrogers@example.org", country: "FR", city: "East Sarahton" },
  { name: "Virginia Alvarez", email: "jeffrey33@example.net", country: "CH", city: "Vickiefort" },
  { name: "Samantha Brown", email: "jason80@example.com", country: "BE", city: "New Johnville" },
  { name: "Lynn Best", email: "robertcompton@example.com", country: "AU", city: "Theresaton" },
  { name: "Jeffery Harris", email: "rogerswyatt@example.net", country: "AU", city: "Bradleyside" },
  { name: "Thomas Miranda", email: "agordon@example.org", country: "IE", city: "North Anthony" },
  { name: "Charles Robles", email: "anthony07@example.org", country: "AU", city: "Amberside" },
  { name: "Lisa Mitchell", email: "millertimothy@example.com", country: "DK", city: "New Miranda" },
  { name: "Stephen Perry", email: "ortegamark@example.net", country: "ES", city: "Richardsonview" },
  { name: "Jill Strickland", email: "lisa10@example.com", country: "AU", city: "Ethanside" },
  { name: "Erika Conrad", email: "jennifer51@example.org", country: "NZ", city: "New Markshire" },
  { name: "Joel Walker", email: "juarezdavid@example.org", country: "DE", city: "West John" },
  { name: "Deborah Blevins", email: "boltonjessica@example.org", country: "CH", city: "Michaelland" },
  { name: "Rhonda Stevenson", email: "ltorres@example.com", country: "AU", city: "East Ronald" },
  { name: "William Ramirez", email: "robinsimmons@example.com", country: "FR", city: "Morganmouth" },
  { name: "Richard Roberson", email: "justindavid@example.com", country: "AU", city: "Anthonyhaven" },
  { name: "Jeremy Ferguson", email: "sschaefer@example.com", country: "CH", city: "Dunnmouth" },
  { name: "Jordan Shelton", email: "ojones@example.org", country: "FR", city: "North Brittany" },
  { name: "Derrick King", email: "benjaminlewis@example.org", country: "BE", city: "Moorebury" },
  { name: "Dawn Warner", email: "carla88@example.org", country: "CZ", city: "New Monicamouth" },
  { name: "Kimberly Daniels", email: "careydiana@example.org", country: "AT", city: "Basshaven" },
  { name: "Donna Briggs", email: "joseph94@example.org", country: "NL", city: "Lake Victor" },
  { name: "Veronica Copeland", email: "tinaserrano@example.net", country: "NL", city: "South Charles" },
  { name: "Michael Garcia", email: "jenna12@example.com", country: "NO", city: "Hernandezmouth" },
  { name: "Joseph Harris", email: "martinezrichard@example.org", country: "ES", city: "Davidhaven" },
  { name: "Nichole Cox", email: "joshuaclark@example.org", country: "PL", city: "Juliemouth" },
  { name: "Susan Sanford", email: "latashaalvarez@example.net", country: "AU", city: "Larabury" },
  { name: "Daniel Rodriguez", email: "laura09@example.net", country: "IT", city: "Joannafort" },
  { name: "Audrey Lawrence", email: "kwelch@example.net", country: "PL", city: "Lake Bradleymouth" },
  { name: "Megan Wright", email: "rachel16@example.org", country: "BE", city: "Kevinfurt" },
  { name: "Maxwell Valencia", email: "jeffreywilliams@example.net", country: "IT", city: "New Dianafort" },
  { name: "Melissa Valentine", email: "cassandra85@example.com", country: "CH", city: "East Denisefort" },
  { name: "Sierra Walters", email: "sarah21@example.net", country: "BE", city: "Jamesville" },
  { name: "Linda Pollard", email: "cynthiagreen@example.com", country: "AU", city: "South Lauriefort" },
  { name: "Tammy Armstrong", email: "adamsryan@example.com", country: "FR", city: "Raymondstad" },
  { name: "Robert Morales", email: "jeremy53@example.net", country: "IE", city: "Caseville" },
  { name: "Nicole Johnson", email: "johnsonjeremy@example.net", country: "NZ", city: "Clineland" },
  { name: "Scott Middleton", email: "stephenbrown@example.com", country: "SE", city: "Port Gregory" },
  { name: "Fernando Black", email: "isaiahwilliams@example.net", country: "BE", city: "New Kaylabury" },
  { name: "Jeffrey Green", email: "juancruz@example.net", country: "US", city: "Cochranfort" },
  { name: "Juan Stewart", email: "kbrown@example.org", country: "AT", city: "Timothyland" },
  { name: "Valerie Salas", email: "levans@example.org", country: "ES", city: "West Melanieside" },
  { name: "Casey Anderson", email: "whitakerandrea@example.com", country: "IT", city: "New Debrafort" },
  { name: "Nicole Zimmerman", email: "wesleydean@example.org", country: "DE", city: "South Benjamintown" },
  { name: "Sarah Watts", email: "jonathan73@example.net", country: "DK", city: "Houstonstad" },
  { name: "Nathan Sanders", email: "crystal34@example.net", country: "NZ", city: "Fisherbury" },
  { name: "Leslie Acosta", email: "udougherty@example.com", country: "CA", city: "Martinburgh" },
  { name: "Morgan Mclaughlin", email: "taylor75@example.com", country: "DE", city: "Collierbury" },
  { name: "Adam Marshall", email: "floresmelissa@example.org", country: "ES", city: "Cheyenneborough" },
  { name: "Joshua Hudson", email: "courtney15@example.net", country: "CZ", city: "Robertchester" },
  { name: "Jason Sandoval", email: "whiteheadalvin@example.com", country: "NO", city: "South Robert" },
  { name: "Jordan Greer", email: "qwood@example.com", country: "CA", city: "Darinberg" },
  { name: "Anne Perry", email: "michael68@example.com", country: "DE", city: "West Susan" },
  { name: "Amanda Gross", email: "sgallagher@example.org", country: "BE", city: "Hubbardshire" },
  { name: "Kristen Dominguez", email: "cheath@example.org", country: "NO", city: "Markbury" },
  { name: "David Ward", email: "danielssean@example.net", country: "AT", city: "Anthonyshire" },
  { name: "Rodney Middleton", email: "meyertimothy@example.org", country: "ES", city: "North Brandon" },
  { name: "Richard Cline", email: "wesleymcmillan@example.com", country: "DE", city: "Port Matthew" },
  { name: "Timothy Alvarado", email: "benjamin16@example.net", country: "DE", city: "East Robert" },
  { name: "Theresa Hughes", email: "matthew89@example.net", country: "NZ", city: "Annaland" },
  { name: "Bradley Collier", email: "xstone@example.com", country: "BE", city: "Flemingburgh" },
  { name: "Christopher Turner", email: "johnklein@example.net", country: "DE", city: "Skinnerbury" },
  { name: "Kevin Harris", email: "cardenassonya@example.com", country: "CA", city: "Garciachester" },
  { name: "Rachel Adams", email: "melissa87@example.com", country: "NO", city: "Hillfurt" },
  { name: "Eric French", email: "joshua72@example.com", country: "NL", city: "South Robert" },
  { name: "Brian Martin", email: "yangsarah@example.net", country: "DE", city: "Josephhaven" },
  { name: "Angela Allen", email: "kenneth09@example.org", country: "SE", city: "South Sean" },
  { name: "David Davenport", email: "diana37@example.com", country: "IT", city: "Port Feliciaborough" },
  { name: "Caitlin Meyer", email: "lance94@example.net", country: "DK", city: "Port Troychester" },
  { name: "Scott White", email: "dustin48@example.org", country: "NO", city: "Porterton" },
  { name: "Anna Bartlett", email: "munozsarah@example.com", country: "DE", city: "Port Catherineberg" },
  { name: "Adam Estrada", email: "john02@example.net", country: "CA", city: "West Jeremy" },
  { name: "Daniel Ferguson", email: "tonyjohnson@example.org", country: "IE", city: "Lake Connie" },
  { name: "Savannah Collier", email: "scottlowery@example.org", country: "GB", city: "Port Charles" },
  { name: "Anna Alexander", email: "chelsea84@example.net", country: "NZ", city: "Christophermouth" },
  { name: "Elizabeth Murillo", email: "lhunter@example.com", country: "NL", city: "Brownshire" },
  { name: "Dana Thomas", email: "heatherlee@example.com", country: "NO", city: "Virginiatown" },
  { name: "Christina Cox", email: "victoriamiller@example.com", country: "BE", city: "Clarkstad" },
  { name: "Courtney Bowman", email: "oevans@example.org", country: "IT", city: "Lake Maria" },
  { name: "Roy Hawkins", email: "vhuffman@example.org", country: "ES", city: "Danielville" },
  { name: "Veronica Galvan", email: "michelle43@example.com", country: "NO", city: "South Alexandrachester" },
  { name: "Matthew Lee", email: "joneslaura@example.org", country: "PT", city: "East Christopherborough" },
  { name: "Dylan Howe", email: "johnschultz@example.com", country: "NL", city: "Dawnhaven" },
  { name: "Linda Cox MD", email: "millercharles@example.org", country: "BE", city: "Shahbury" },
  { name: "Christian Ferguson", email: "hgoodman@example.net", country: "CA", city: "Williamsbury" },
  { name: "Gerald Cline", email: "housesean@example.net", country: "FR", city: "New Matthew" },
  { name: "Peter Powers", email: "ngrimes@example.net", country: "NZ", city: "Jessicaborough" },
  { name: "Matthew Davis II", email: "amandaprice@example.org", country: "SE", city: "West William" },
  { name: "Michelle Hunter", email: "alejandro70@example.com", country: "NO", city: "Tranfurt" },
  { name: "Michael Cunningham", email: "lauren31@example.com", country: "PL", city: "Port Teresa" },
  { name: "Brendan Floyd", email: "cantrellcarla@example.com", country: "IE", city: "North Bradleystad" },
  { name: "Calvin Perez", email: "mli@example.com", country: "IE", city: "Amymouth" },
  { name: "Isabel Smith", email: "hramos@example.com", country: "CZ", city: "Lake Shannonton" },
  { name: "Corey Rojas", email: "michael19@example.org", country: "NO", city: "Jonesshire" },
  { name: "Brenda Henry", email: "bennettnicole@example.net", country: "ES", city: "Aaronborough" },
  { name: "John Graham", email: "chadrios@example.com", country: "NZ", city: "Lake Rodneyhaven" },
  { name: "Anthony Miller PhD", email: "kstone@example.org", country: "PL", city: "East Kyle" },
  { name: "Kayla Jordan", email: "richardhill@example.com", country: "ES", city: "South Ashleyborough" },
  { name: "Shannon Miller", email: "chelsea99@example.com", country: "IT", city: "Brentborough" },
  { name: "Terry Best", email: "rhall@example.com", country: "IT", city: "Staceystad" },
  { name: "Joshua Cabrera", email: "bradleyprice@example.net", country: "GB", city: "Port Jacob" },
  { name: "Julia Thomas", email: "prussell@example.net", country: "IE", city: "Lake Maria" },
  { name: "Jennifer Gray", email: "gary10@example.com", country: "IT", city: "Andersonview" },
  { name: "Benjamin Turner", email: "andrewaguilar@example.com", country: "NZ", city: "Lake Steve" },
  { name: "Charles Ferguson", email: "morgantimothy@example.net", country: "FR", city: "Andrewsside" },
  { name: "Rick Brown", email: "charles51@example.net", country: "NL", city: "Jonberg" },
  { name: "Gregory Johnson", email: "millermelissa@example.com", country: "AU", city: "North Danielfurt" },
  { name: "Christina Larson", email: "fnelson@example.net", country: "NZ", city: "Hollyland" },
  { name: "Raymond Olsen", email: "chardin@example.net", country: "NL", city: "Wrightview" },
  { name: "Jill Park", email: "tinamason@example.org", country: "IE", city: "Tanyaville" },
  { name: "Samuel Bell", email: "adammccoy@example.net", country: "PT", city: "West Harry" },
  { name: "Kristin Rodriguez", email: "fneal@example.com", country: "AT", city: "Snyderfort" },
  { name: "Charles Martin", email: "ijones@example.org", country: "US", city: "Atkinstown" },
  { name: "Sharon Jensen", email: "meyerlori@example.com", country: "CH", city: "Smithport" },
  { name: "Tammy Booth", email: "lauraphillips@example.com", country: "AT", city: "West Paul" },
  { name: "James Patterson", email: "christopher95@example.org", country: "PT", city: "North Joseph" },
  { name: "Ashley Hamilton", email: "samantha19@example.net", country: "BE", city: "Ramireztown" },
  { name: "Eric Cameron", email: "michelleshelton@example.org", country: "FR", city: "West Sean" },
  { name: "Larry Estes", email: "smithjill@example.com", country: "CZ", city: "West Rebecca" },
  { name: "Justin Wade", email: "owenangel@example.com", country: "IT", city: "New Emma" },
  { name: "Karen Harrison", email: "xchase@example.com", country: "IE", city: "Cherylport" },
  { name: "Stephen Larson", email: "yorkpeggy@example.org", country: "US", city: "North Jennifer" },
  { name: "Taylor Singleton", email: "bruce71@example.com", country: "PT", city: "Debrafort" },
  { name: "Shannon Snow", email: "ashley87@example.org", country: "US", city: "Roychester" },
  { name: "David Baker", email: "pittmanstephen@example.org", country: "AU", city: "Port Sharon" },
  { name: "Elizabeth Gomez", email: "millerandrew@example.net", country: "DE", city: "Jamesshire" },
  { name: "Jessica Wright", email: "masonjacob@example.org", country: "PL", city: "Port Sarahfurt" },
  { name: "Tyler Fields", email: "ktorres@example.net", country: "AT", city: "Carrtown" },
  { name: "Lisa Yates", email: "lisa43@example.org", country: "NO", city: "Lake Kristin" },
  { name: "Rachel Sanders", email: "josephpugh@example.org", country: "SE", city: "North Meagan" },
  { name: "Lauren Robinson", email: "pmorris@example.com", country: "PT", city: "Karlchester" },
  { name: "Miguel Miller", email: "sadams@example.org", country: "AT", city: "Port Jimmymouth" },
  { name: "Kyle Long", email: "nicolebarron@example.com", country: "DK", city: "North Angelicastad" },
  { name: "Juan Chang", email: "lawrencenguyen@example.net", country: "CH", city: "South Haroldborough" },
  { name: "Michael Mason", email: "ahunt@example.net", country: "IT", city: "Floydland" },
  { name: "Glenn Sullivan", email: "emily24@example.net", country: "SE", city: "Gardnerchester" },
  { name: "Tyler King", email: "fishercandice@example.com", country: "NL", city: "North Gregory" },
  { name: "Alison Lester", email: "gfoster@example.com", country: "SE", city: "Ruthbury" },
  { name: "Martin Acevedo", email: "jessicabrooks@example.org", country: "GB", city: "Duranside" },
  { name: "Stephen Pierce", email: "bobbyle@example.org", country: "FR", city: "Stewarttown" },
  { name: "Amy Adams", email: "amccoy@example.com", country: "AT", city: "New Randall" },
  { name: "Scott Blair", email: "mrollins@example.net", country: "FR", city: "North Robert" },
  { name: "Hector Alvarado", email: "emilybrown@example.org", country: "US", city: "Lake Jacob" },
  { name: "Matthew Walker", email: "gallagherdeanna@example.net", country: "DE", city: "North Jacob" },
  { name: "Joyce Brooks", email: "bjohnson@example.net", country: "FR", city: "North James" },
  { name: "David Hayden", email: "jose14@example.com", country: "ES", city: "East Lori" },
  { name: "Mary Parker", email: "hbrown@example.org", country: "PT", city: "Juliehaven" },
  { name: "Diana Decker", email: "thomasstrickland@example.com", country: "GB", city: "West Beverlymouth" },
  { name: "Vickie Walton", email: "kingtiffany@example.com", country: "IT", city: "South Cynthia" },
  { name: "Caroline Douglas", email: "lewissheri@example.com", country: "FR", city: "New George" },
  { name: "Meghan Thornton", email: "vhuffman@example.net", country: "CA", city: "Pierceburgh" },
  { name: "Virginia Long", email: "christophersmith@example.org", country: "IT", city: "West Johnstad" },
  { name: "Mary Meza", email: "maria57@example.com", country: "GB", city: "Port Kristenhaven" },
  { name: "James Weeks", email: "ryan68@example.com", country: "US", city: "Brownton" },
  { name: "Melanie Price", email: "natashapalmer@example.org", country: "CH", city: "Kellyfort" },
  { name: "Sheryl Garcia", email: "ejacobs@example.net", country: "FR", city: "New Tiffanyton" },
  { name: "Michael Pearson", email: "jenniferthompson@example.com", country: "NL", city: "Emilyfort" },
  { name: "Barry Romero", email: "mcox@example.org", country: "CA", city: "New Amystad" },
  { name: "Lisa Haley", email: "gabrielle79@example.net", country: "NO", city: "Johnstonside" },
  { name: "Thomas Wheeler", email: "tommylester@example.com", country: "GB", city: "Mitchellport" },
  { name: "Jeff Davis", email: "shortkatherine@example.net", country: "PL", city: "Jamesstad" },
  { name: "Chad Sanchez", email: "popejacob@example.net", country: "PL", city: "Justinside" },
  { name: "Heather Vargas", email: "avilasabrina@example.net", country: "AU", city: "New Jeremiahberg" },
  { name: "Matthew Middleton", email: "evan15@example.com", country: "ES", city: "Port Calebtown" },
  { name: "Mrs. Rebecca Walker", email: "brittany77@example.org", country: "PL", city: "Port Ryan" },
  { name: "Tiffany Beltran", email: "emily58@example.org", country: "GB", city: "Farleyland" },
  { name: "Denise White", email: "tfisher@example.org", country: "ES", city: "Crawfordton" },
  { name: "Brian Hernandez", email: "edward47@example.net", country: "US", city: "Bethview" },
  { name: "Andrea Zimmerman", email: "hannah83@example.org", country: "PL", city: "Port Rodneyfort" },
  { name: "Madison Keller", email: "lancegray@example.com", country: "CZ", city: "Leonmouth" },
  { name: "Tracy Williams", email: "robert71@example.com", country: "AT", city: "Nguyenfurt" },
  { name: "John Walker", email: "newmangary@example.com", country: "PL", city: "Smithburgh" },
  { name: "Matthew Benson DDS", email: "robert46@example.com", country: "CA", city: "Sandersstad" },
];

function slugify(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, ".")
    .replace(/^\.+|\.+$/g, "");
}

function emailFor(seed: { name: string; email: string }): string {
  if (seed.email && seed.email.includes("@")) return seed.email;
  const slug = slugify(seed.name) || "customer";
  return `${slug}@customer.local`;
}

type PickResult = {
  ok: true;
  name: string;
  email: string;
  country: string | null;
  exhausted: boolean;
  poolSize: number;
};

async function pickCustomer(
  supabase: ReturnType<typeof createClient>,
  source: "seed" | "history" = "seed",
): Promise<PickResult> {
  // Pull past bancontact orders both to tally usage AND (for "history" mode)
  // to source the pool of names.
  const { data: prev } = await supabase
    .from("bancontact_orders")
    .select("customer_name, customer_email, country");
  const counts = new Map<string, number>();
  const historyMap = new Map<string, { name: string; email: string; country: string }>();
  for (const r of (prev || []) as Array<{ customer_name: string | null; customer_email: string | null; country: string | null }>) {
    const k = (r.customer_name || "").trim().toLowerCase();
    if (!k) continue;
    counts.set(k, (counts.get(k) ?? 0) + 1);
    if (!historyMap.has(k)) {
      historyMap.set(k, {
        name: r.customer_name || "",
        email: r.customer_email || "",
        country: r.country || "",
      });
    }
  }

  // Choose the pool based on source.
  let pool: Array<{ name: string; email: string; country: string }>;
  if (source === "history") {
    pool = Array.from(historyMap.values());
    if (pool.length === 0) {
      // Fallback to seed pool if no history exists yet.
      pool = SEED_CUSTOMERS.map((s) => ({ name: s.name, email: s.email, country: s.country }));
    }
  } else {
    pool = SEED_CUSTOMERS.map((s) => ({ name: s.name, email: s.email, country: s.country }));
  }

  // Find the minimum usage count across the chosen pool, then pick at random
  // from everyone tied at that minimum. When everyone is at >=1 we've
  // "exhausted" one full cycle and naturally jumble + reuse from there.
  let minCount = Infinity;
  for (const s of pool) {
    const c = counts.get(s.name.toLowerCase()) ?? 0;
    if (c < minCount) minCount = c;
  }
  if (minCount === Infinity) minCount = 0;
  const tier = pool.filter(
    (s) => (counts.get(s.name.toLowerCase()) ?? 0) === minCount,
  );
  const chosen = pick(tier);

  return {
    ok: true,
    name: chosen.name,
    email: emailFor(chosen),
    country: chosen.country || null,
    exhausted: minCount >= 1,
    poolSize: pool.length,
  };
}

async function buildRandomItems(supabase: ReturnType<typeof createClient>): Promise<{ items: BancItem[]; total: number }> {
  // Pull a wide pool of past order items to draw from.
  const { data } = await supabase
    .from("orders")
    .select("order_items")
    .neq("status", "pending_approval")
    .order("created_at", { ascending: false })
    .limit(150);
  const pool: BancItem[] = [];
  for (const row of (data || []) as Array<{ order_items: any }>) {
    const arr = Array.isArray(row.order_items) ? row.order_items : [];
    for (const it of arr) {
      if (!it || typeof it !== "object") continue;
      const price = Number(it.price);
      if (!isFinite(price) || price <= 0 || price > 120) continue;
      pool.push({
        name: String(it.name || "Fragrance"),
        brand: String(it.brand || "Brand"),
        price,
        quantity: 1,
        selectedMl: typeof it.selectedMl === "number" ? it.selectedMl : undefined,
      });
    }
  }
  // Fallback pool if no items
  if (pool.length === 0) {
    pool.push(
      { name: "Aventus", brand: "Creed", price: 49.99, quantity: 1, selectedMl: 50 },
      { name: "Sauvage", brand: "Dior", price: 39.99, quantity: 1, selectedMl: 100 },
      { name: "Eros", brand: "Versace", price: 34.99, quantity: 1, selectedMl: 100 },
    );
  }

  // Try up to 15 random compositions, pick the first whose total is 20-150.
  for (let attempt = 0; attempt < 15; attempt++) {
    const count = 1 + Math.floor(Math.random() * 3); // 1..3
    const picked: BancItem[] = [];
    for (let i = 0; i < count; i++) {
      picked.push({ ...pick(pool) });
    }
    const total = picked.reduce((s, it) => s + it.price * it.quantity, 0);
    if (total >= 20 && total <= 150) {
      return { items: picked, total: Math.round(total * 100) / 100 };
    }
  }
  // Last resort: take a single cheap item from the pool.
  const cheap = pool
    .filter((it) => it.price >= 20 && it.price <= 100)
    .sort(() => Math.random() - 0.5)[0] || pool[0];
  return {
    items: [{ ...cheap, quantity: 1 }],
    total: Math.round(cheap.price * 100) / 100,
  };
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const body = await req.json().catch(() => ({} as any));
    const mode: "random" | "custom" = body?.mode === "custom" ? "custom" : "random";
    const source: string = body?.source === "timed" ? "timed" : mode;
    const customerSource: "seed" | "history" = body?.customerSource === "history" ? "history" : "seed";

    const pickRes = await pickCustomer(supabase, customerSource);
    const customer = { name: pickRes.name, email: pickRes.email, country: pickRes.country };

    let items: BancItem[];
    let total: number;

    if (mode === "custom") {
      const rawItems = Array.isArray(body?.items) ? body.items : [];
      if (rawItems.length === 0) {
        return new Response(JSON.stringify({ error: "Custom mode requires items." }),
          { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 });
      }
      items = rawItems.map((it: any) => ({
        name: String(it.name || "Fragrance"),
        brand: String(it.brand || "Brand"),
        price: Number(it.price) || 0,
        quantity: Math.max(1, Math.floor(Number(it.quantity) || 1)),
        selectedMl: typeof it.selectedMl === "number" ? it.selectedMl : undefined,
      }));
      const providedTotal = Number(body?.total);
      total = isFinite(providedTotal) && providedTotal > 0
        ? Math.round(providedTotal * 100) / 100
        : Math.round(items.reduce((s, it) => s + it.price * it.quantity, 0) * 100) / 100;
    } else {
      const built = await buildRandomItems(supabase);
      items = built.items;
      total = built.total;
    }

    const token = genToken();
    const { data: order, error: insErr } = await supabase
      .from("bancontact_orders")
      .insert({
        customer_name: customer.name,
        customer_email: customer.email,
        country: customer.country,
        order_items: items,
        total_amount: total,
        status: "pending",
        approval_token: token,
        source,
      })
      .select("id")
      .single();
    if (insErr || !order) throw new Error(`Failed to create bancontact order: ${insErr?.message}`);

    const html = buildEmailHtml(order.id, token, customer.name, customer.email, customer.country, items, total, supabaseUrl);
    const subject = `Bancontact Order: ${customer.name} - EUR${total.toFixed(2)}`;
    await sendEmail(RECIPIENT, subject, html);

    return new Response(JSON.stringify({
      success: true,
      orderId: order.id,
      customer: customer.name,
      total,
      exhausted: pickRes.exhausted,
      poolSize: pickRes.poolSize,
      warning: pickRes.exhausted
        ? `Seed pool fully cycled (${pickRes.poolSize} customers). Reusing names from a jumbled rotation.`
        : undefined,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 200 });
  } catch (e: any) {
    console.error("bancontact-generate error:", e);
    return new Response(JSON.stringify({ error: e.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 });
  }
});
