/* eslint-disable no-unused-vars */
import React from "react";
import { motion } from "framer-motion";
import ZoneCard from "./ZoneCard";

export default function ZonesGrid({ zones, onSelectZone, onHoverZone }) {
  return (
    <motion.div
      className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4"
      initial="hidden"
      animate="visible"
      variants={{ visible: { transition: { staggerChildren: 0.05 } } }}
    >
      {zones.map((zone, idx) => (
        <div
          key={zone.id}
          onMouseEnter={() => onHoverZone?.(zone.id)}
          onMouseLeave={() => onHoverZone?.(null)}
          className="cursor-pointer"
        >
          <ZoneCard
            zone={zone}
            index={idx}
            size="sm"
            onExplore={() => onSelectZone(zone)}
          />
        </div>
      ))}
    </motion.div>
  );
}
