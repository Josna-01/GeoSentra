import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

const FeatureCard = ({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
      viewport={{ once: true }}
    >
      <Card variant="glass-hover" className="h-full cursor-pointer">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <div className="p-3 rounded-xl bg-primary/20 backdrop-blur-sm">
            <Icon size={28} className="text-accent" />
          </div>
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <p className="text-white/70 text-sm leading-relaxed">{description}</p>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default FeatureCard;
