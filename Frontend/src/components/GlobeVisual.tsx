import { motion } from "framer-motion";

const GlobeVisual = () => {
  return (
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Outer glow rings */}
      <motion.div
        animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.1, 0.3] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        className="absolute w-[600px] h-[600px] md:w-[800px] md:h-[800px] rounded-full border border-white/10"
      />
      <motion.div
        animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.05, 0.2] }}
        transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
        className="absolute w-[700px] h-[700px] md:w-[900px] md:h-[900px] rounded-full border border-white/5"
      />

      {/* Central globe */}
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1, delay: 0.5 }}
        className="relative w-[300px] h-[300px] md:w-[400px] md:h-[400px]"
      >
        {/* Globe base */}
        <div className="absolute inset-0 rounded-full bg-gradient-to-br from-primary/30 via-transparent to-accent/20 backdrop-blur-3xl" />
        
        {/* Grid lines */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full opacity-30">
          {/* Latitude lines */}
          {[40, 70, 100, 130, 160].map((y) => (
            <ellipse
              key={y}
              cx="100"
              cy={y}
              rx={Math.sqrt(100 * 100 - Math.pow(y - 100, 2))}
              ry="10"
              fill="none"
              stroke="white"
              strokeWidth="0.5"
            />
          ))}
          {/* Longitude lines */}
          <ellipse cx="100" cy="100" rx="80" ry="80" fill="none" stroke="white" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="60" ry="80" fill="none" stroke="white" strokeWidth="0.5" />
          <ellipse cx="100" cy="100" rx="30" ry="80" fill="none" stroke="white" strokeWidth="0.5" />
        </svg>

        {/* Pulsing risk indicators */}
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute top-[30%] left-[40%] w-3 h-3 bg-red-500 rounded-full shadow-lg shadow-red-500/50"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.5 }}
          className="absolute top-[50%] left-[65%] w-2 h-2 bg-yellow-500 rounded-full shadow-lg shadow-yellow-500/50"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1 }}
          className="absolute top-[60%] left-[30%] w-2 h-2 bg-green-500 rounded-full shadow-lg shadow-green-500/50"
        />
        <motion.div
          animate={{ scale: [1, 1.5, 1], opacity: [1, 0.5, 1] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.3 }}
          className="absolute top-[35%] left-[60%] w-2 h-2 bg-red-400 rounded-full shadow-lg shadow-red-400/50"
        />

        {/* Connection lines */}
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full">
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse" }}
            d="M 80 60 Q 100 80 130 100"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="1"
          />
          <motion.path
            initial={{ pathLength: 0, opacity: 0 }}
            animate={{ pathLength: 1, opacity: 0.4 }}
            transition={{ duration: 2, delay: 0.5, repeat: Infinity, repeatType: "reverse" }}
            d="M 130 100 Q 100 110 60 120"
            fill="none"
            stroke="url(#line-gradient)"
            strokeWidth="1"
          />
          <defs>
            <linearGradient id="line-gradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#41729f" stopOpacity="0" />
              <stop offset="50%" stopColor="#e1f1ff" stopOpacity="1" />
              <stop offset="100%" stopColor="#41729f" stopOpacity="0" />
            </linearGradient>
          </defs>
        </svg>
      </motion.div>

      {/* Orbiting elements */}
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ duration: 30, repeat: Infinity, ease: "linear" }}
        className="absolute w-[350px] h-[350px] md:w-[500px] md:h-[500px]"
      >
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 bg-accent rounded-full" />
      </motion.div>
      <motion.div
        animate={{ rotate: -360 }}
        transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
        className="absolute w-[400px] h-[400px] md:w-[550px] md:h-[550px]"
      >
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full" />
      </motion.div>
    </div>
  );
};

export default GlobeVisual;
