import.meta.glob([
  '../images/**',
  '../fonts/**',
]);

import alpine from 'alpinejs';
import PixelMatrix from './pixel-matrix';
import jackalope3DGame from './jackalope-game';

// Initialize PixelMatrix on pricing boxes
document.addEventListener('DOMContentLoaded', () => {
  const pricingBoxes = document.querySelectorAll('.pricing-box');
  pricingBoxes.forEach(box => new PixelMatrix(box));
});

document.addEventListener('alpine:init', () => {
  // Add dark mode store with simple state management
  alpine.store('darkMode', {
    on: true, // Default to dark mode
    
    init() {
      // Apply initial dark mode state to body
      document.body.classList.toggle('dark', this.on);
    },
    
    toggle() {
      this.on = !this.on;
      document.body.classList.toggle('dark', this.on);
    }
  });

  // Register jackalope3DGame component
  alpine.data('jackalope3DGame', jackalope3DGame);

  // Make darkMode accessible in Alpine components
  alpine.data('globalData', () => ({
    get darkMode() {
      return this.$store.darkMode.on;
    }
  }));
});

// Start Alpine
alpine.start();

