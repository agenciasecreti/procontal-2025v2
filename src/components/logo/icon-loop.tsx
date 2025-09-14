import { motion } from 'framer-motion';

export default function IconLoop({ width }: { width: number }) {
  return (
    <motion.svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1655.08 1122.53" width={width}>
      {/* Contorno laranja desenhando */}
      <motion.path
        d="M1554.72,379.42c0,203.74-165.39,378.71-378.72,378.71h0c-87.01,0-187.81,64.74-224,143.86l-37.26,81.45c-9.59,21.57-33.56,38.35-57.53,38.35h-242.09l239.69-517.74h321.19c52.73,0,124.64-43.14,124.64-124.64,0-64.72-52.73-124.64-124.64-124.64H247.74c-77.42,0-114.22-57.51-81.78-127.81l41.68-90.31C217.24,15.09,241.21.7,265.18.7h910.83c218.12,0,378.72,179.77,378.72,378.71Z"
        fill="transparent"
        stroke="#f28a18"
        strokeWidth="5"
        animate={{
          pathLength: [0, 1, 1],
          opacity: [1, 1, 0],
        }}
        transition={{
          duration: 4,
          times: [0, 0.5, 1],
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />

      {/* Preenchimento laranja que aparece depois */}
      <motion.path
        d="M1554.72,379.42c0,203.74-165.39,378.71-378.72,378.71h0c-87.01,0-187.81,64.74-224,143.86l-37.26,81.45c-9.59,21.57-33.56,38.35-57.53,38.35h-242.09l239.69-517.74h321.19c52.73,0,124.64-43.14,124.64-124.64,0-64.72-52.73-124.64-124.64-124.64H247.74c-77.42,0-114.22-57.51-81.78-127.81l41.68-90.31C217.24,15.09,241.21.7,265.18.7h910.83c218.12,0,378.72,179.77,378.72,378.71Z"
        fill="#f28a18"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 0],
        }}
        transition={{
          duration: 4,
          delay: 2,
          times: [0, 0.5, 1],
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
        }}
      />

      {/* Polígono branco surgindo junto */}
      <motion.polygon
        points="0 503.66 72.59 617.72 377.81 617.72 248.06 893.42 330.22 1022.53 574.43 503.66 0 503.66"
        fill="#fff"
        initial={{ opacity: 0, x: -80, y: 80 }}
        animate={{
          opacity: [0, 1, 0],
          x: [-80, 0, 0],
          y: [80, 0, 0],
        }}
        transition={{
          duration: 4,
          times: [0, 0.2, 1],
          ease: 'easeInOut',
          repeat: Infinity,
          repeatDelay: 0.5,
          delay: 2, // começa depois do laranja
        }}
      />
    </motion.svg>
  );
}
