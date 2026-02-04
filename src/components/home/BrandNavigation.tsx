import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';

const brands = [
  { name: 'Versace', slug: 'versace' },
  { name: 'JPG', slug: 'jpg' },
  { name: 'YSL', slug: 'ysl' },
  { name: 'Azzaro', slug: 'azzaro' },
  { name: 'Armani', slug: 'armani' },
  { name: 'LouisV', slug: 'lv' },
  { name: 'PDM', slug: 'pdm' },
  { name: 'Creed', slug: 'creed' },
  { name: 'Mancera', slug: 'mancera' },
];

export const BrandNavigation = () => {
  return (
    <motion.section 
      className="py-4 bg-secondary border-b border-border"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <div className="container">
        <div className="flex items-center justify-center gap-4 md:gap-6 lg:gap-8 flex-wrap">
          {brands.map((brand) => (
            <Link
              key={brand.slug}
              to={`/shop?brand=${brand.slug}`}
              className="text-[10px] md:text-xs tracking-[0.15em] font-medium text-foreground/70 hover:text-accent uppercase transition-colors duration-200"
            >
              {brand.name}
            </Link>
          ))}
          <Link
            to="/shop"
            className="text-[10px] md:text-xs tracking-[0.15em] font-medium text-accent hover:text-accent/80 uppercase transition-colors duration-200"
          >
            See all fragrances
          </Link>
        </div>
      </div>
    </motion.section>
  );
};
