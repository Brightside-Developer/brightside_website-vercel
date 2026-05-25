const fs = require('fs');
const path = require('path');

const htmlPath = path.join(__dirname, '../chapters.html');
const outputPath = path.join(__dirname, '../src/components/USMap.tsx');

const htmlContent = fs.readFileSync(htmlPath, 'utf8');

// Find the SVG start and end
const svgStartIdx = htmlContent.indexOf('<svg xmlns="http://www.w3.org/2000/svg" width="959" height="593" class="interactive-map" viewBox="0 0 959 593">');
const svgEndIdx = htmlContent.indexOf('</svg>', svgStartIdx) + 6;

if (svgStartIdx === -1 || svgEndIdx === -1) {
  console.error("Could not find interactive-map SVG in chapters.html");
  process.exit(1);
}

let svgString = htmlContent.substring(svgStartIdx, svgEndIdx);

// We need to transform the SVG string to be valid React/JSX:
// 1. Replace HTML-style attributes with React-style:
//    - stroke-width -> strokeWidth
//    - stroke-dasharray -> strokeDasharray
//    - stroke-dashoffset -> strokeDashoffset
//    - transform-origin -> transformOrigin
//    - font-size -> fontSize
//    - font-weight -> fontWeight
//    - text-anchor -> textAnchor
//    - class="state-path" -> className="state-path"
//    - class="state-path chapter-active" -> className="state-path chapter-active"
//    - class="hq-marker" -> className="hq-marker"
//    - class="hq-pulse" -> className="hq-pulse"
//    - onclick="openHQPopup(event)" -> onClick={onHQClick}
//    - data-* attributes are actually fine in React, but let's make sure they are correct.
// 2. Remove standard event handlers or replace them.
// Let's replace class -> className
svgString = svgString.replace(/class=/g, 'className=');
svgString = svgString.replace(/stroke-width=/g, 'strokeWidth=');
svgString = svgString.replace(/transform-origin=/g, 'transformOrigin=');
svgString = svgString.replace(/font-size=/g, 'fontSize=');
svgString = svgString.replace(/font-weight=/g, 'fontWeight=');
svgString = svgString.replace(/text-anchor=/g, 'textAnchor=');
svgString = svgString.replace(/onclick="openHQPopup\(event\)"/g, 'onClick={handleHQClick}');

// We want to hook up state click handlers to paths.
// Let's replace each <path class="state-path ..."> with an interactive click listener!
// Wait, we can do it by rendering paths dynamically or by replacing the static paths.
// Let's write USMap as a functional React component that parses these paths and wraps them.
// Let's see: instead of rewriting everything in JS regex, we can extract the paths as JSON data and render them in a clean .map() loop!
// That is MUCH cleaner, highly maintainable, and allows us to easily use framer-motion on paths!
// Let's see if we can extract all <path> tags.
const pathRegex = /<path\s+([^>]+)>/g;
const paths = [];

let match;
while ((match = pathRegex.exec(svgString)) !== null) {
  const attrsStr = match[1];
  // Parse attributes
  const attrs = {};
  const attrRegex = /([a-zA-Z0-9\-]+)="([^"]*)"/g;
  let attrMatch;
  while ((attrMatch = attrRegex.exec(attrsStr)) !== null) {
    attrs[attrMatch[1]] = attrMatch[2];
  }
  
  // Extract child <title> if any
  const startPos = match.index + match[0].length;
  const nextPathPos = svgString.indexOf('<path', startPos);
  const closingTagPos = svgString.indexOf('</path>', startPos);
  
  let title = '';
  if (closingTagPos !== -1 && (nextPathPos === -1 || closingTagPos < nextPathPos)) {
    const inner = svgString.substring(startPos, closingTagPos);
    const titleMatch = /<title>([^<]+)<\/title>/.exec(inner);
    if (titleMatch) {
      title = titleMatch[1];
    }
  }
  
  paths.push({
    d: attrs.d,
    code: attrs['data-code'] || '',
    name: attrs['data-name'] || title || '',
    centerX: attrs['data-center-x'] || '',
    centerY: attrs['data-center-y'] || '',
    chapterCity: attrs['data-chapter-city'] || '',
    chapterName: attrs['data-chapter-name'] || '',
    chapterDesc: attrs['data-chapter-desc'] || '',
    className: attrs.className || ''
  });
}

console.log(`Extracted ${paths.length} paths`);

// Let's also extract any static decorative path groupings if any.
// In the SVG, there is a pointer-events="none" decorative path block at the end (for borders/lines), let's look for it:
// <g pointer-events="none"> ... </g>
const decorativeRegex = /<g pointer-events="none">([\s\S]*?)<\/g>/;
const decorativeMatch = decorativeRegex.exec(svgString);
let decorativePathsHtml = '';
if (decorativeMatch) {
  decorativePathsHtml = decorativeMatch[1]
    .replace(/class=/g, 'className=')
    .replace(/stroke-width=/g, 'strokeWidth=')
    .replace(/pointer-events=/g, 'pointerEvents=');
}

// Generate the React Component code
const componentCode = `'use client';

import React from 'react';
import { motion } from 'framer-motion';

export interface StatePathData {
  d: string;
  code: string;
  name: string;
  centerX?: number;
  centerY?: number;
  chapterCity?: string;
  chapterName?: string;
  chapterDesc?: string;
  className?: string;
}

interface USMapProps {
  onStateSelect: (stateData: StatePathData) => void;
  selectedStateCode: string | null;
  onHQSelect: (event: React.MouseEvent) => void;
}

export const statePaths: StatePathData[] = ${JSON.stringify(paths, null, 2)};

export default function USMap({ onStateSelect, selectedStateCode, onHQSelect }: USMapProps) {
  return (
    <svg 
      xmlns="http://www.w3.org/2000/svg" 
      width="959" 
      height="593" 
      className="w-full h-auto filter drop-shadow-[0_10px_20px_rgba(43,66,36,0.08)] relative z-10 select-none" 
      viewBox="0 0 959 593"
    >
      <g>
        {statePaths.map((state) => {
          const isSelected = selectedStateCode === state.code;
          const hasChapter = state.className?.includes('chapter-active');
          
          return (
            <motion.path
              key={state.code || state.name}
              d={state.d}
              className={\`state-path cursor-pointer transition-colors duration-200 \${
                hasChapter 
                  ? 'fill-mint/80 hover:fill-sage stroke-warm-white dark:fill-mint/60 dark:hover:fill-mint dark:stroke-[#1a1f1a]' 
                  : 'fill-primary/10 hover:fill-primary/20 stroke-warm-white dark:fill-primary/20 dark:hover:fill-primary/30 dark:stroke-[#1a1f1a]'
              } \${
                isSelected 
                  ? '!fill-rust dark:!fill-mint !stroke-white dark:!stroke-charcoal scale-[1.01] drop-shadow-md z-30' 
                  : ''
              }\`}
              style={{ transformOrigin: 'center' }}
              whileHover={{ scale: 1.015, strokeWidth: 2 }}
              onClick={() => onStateSelect(state)}
            >
              <title>{state.name}</title>
            </motion.path>
          );
        })}
        
        {/* Dallas HQ Marker */}
        <g transform="translate(470, 440)">
          <g className="hq-marker cursor-pointer group" onClick={onHQSelect}>
            {/* Pulsing ring */}
            <motion.circle 
              className="fill-primary/20 dark:fill-mint/20"
              r="24"
              animate={{ scale: [1, 1.4, 1] }}
              transition={{ repeat: Infinity, duration: 2, ease: "easeInOut" }}
            />
            {/* Center dot */}
            <circle r="16" className="fill-primary dark:fill-mint group-hover:fill-primary-light dark:group-hover:fill-white transition-colors" />
            <text 
              dy=".35em" 
              fontSize="12" 
              fontWeight="900" 
              className="fill-white dark:fill-charcoal group-hover:scale-105 transition-transform" 
              textAnchor="middle" 
              fontFamily="'DM Sans', sans-serif"
            >
              HQ
            </text>
            <title>Brightside Headquarters - Dallas, TX</title>
          </g>
        </g>
      </g>

      {/* Decorative and border lines */}
      <g pointerEvents="none">
        <path 
          d="m 215,493 v 55 l 36,45 m -251,-168 h 147 l 68,68 h 85 l 54,54 v 46" 
          className="fill-none stroke-gray-300 dark:stroke-gray-700 stroke-[1.5]"
        />
      </g>
    </svg>
  );
}
`;

fs.writeFileSync(outputPath, componentCode);
console.log("Successfully wrote USMap.tsx!");
