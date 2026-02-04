import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { getBundles } from '@/data/products';

export const BundleSection = () => {
  const bundles = getBundles();

  return (
    <section className="py-14 md:py-20 bg-secondary">
      <div className="container">
        <motion.div 
          className="text-center mb-8 md:mb-12"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-50px" }}
          transition={{ duration: 0.5 }}
        >
          <h2 className="font-display text-2xl md:text-3xl lg:text-4xl text-foreground mb-3">
            Check out the fragrance bundles
          </h2>
          <p className="text-sm md:text-base text-muted-foreground max-w-lg mx-auto">
            Save when you bundle these products together
          </p>
        </motion.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          {bundles.map((bundle, index) => (
            <motion.div 
              key={bundle.id}
              className="group bg-background border border-border overflow-hidden"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-30px" }}
              transition={{ duration: 0.4, delay: index * 0.1 }}
            >
              <Link to={`/product/${bundle.id}`} className="block">
                <div className="aspect-square bg-secondary overflow-hidden">
                  <img
                    src={bundle.image}
                    alt={bundle.name}
                    className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    loading="lazy"
                  />
                </div>
                
                <div className="p-5">
                  <h3 className="font-display text-base md:text-lg text-foreground mb-2 group-hover:text-accent transition-colors line-clamp-2">
                    {bundle.name}
                  </h3>
                  <p className="text-xs text-muted-foreground mb-4 line-clamp-2">
                    {bundle.description}
                  </p>
                  <div className="flex items-center justify-between">
                    <span className="text-lg font-semibold text-foreground">
                      €{bundle.price.toFixed(2)}
                    </span>
                    <Button 
                      variant="outline"
                      size="sm"
                      className="text-[10px] font-medium tracking-[0.1em] uppercase rounded-none border-foreground text-foreground hover:bg-foreground hover:text-background"
                    >
                      Shop now
                    </Button>
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};
