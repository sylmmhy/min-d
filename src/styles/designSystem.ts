// Design System Guide - The Mindboat
// Based on transparent glass morphism and ocean theme

export const designSystem = {
  // Color Palette
  colors: {
    // Transparent glass morphism backgrounds
    glass: {
      primary: 'bg-white/10 backdrop-blur-xl',
      secondary: 'bg-white/5 backdrop-blur-lg',
      overlay: 'bg-gradient-to-br from-white/15 via-white/8 to-white/5',
      subtle: 'bg-white/8 backdrop-blur-md',
    },
    
    // Button styles
    buttons: {
      // Transparent glass button (primary style)
      glass: 'bg-white/10 hover:bg-white/15 border border-white/20 hover:border-white/30 text-white/90 hover:text-white backdrop-blur-md',
      // Accent button for important actions
      accent: 'bg-gradient-to-r from-blue-400/30 to-purple-400/30 hover:from-blue-400/40 hover:to-purple-400/40 text-white border border-white/25 backdrop-blur-md',
      // Danger/warning button
      danger: 'bg-red-400/20 hover:bg-red-400/30 border border-red-300/30 text-white backdrop-blur-md',
    },
    
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-white/95',
      muted: 'text-white/80',
      subtle: 'text-white/70',
    },
    
    // Border colors
    borders: {
      glass: 'border-white/20',
      glassHover: 'border-white/30',
      accent: 'border-white/25',
    }
  },

  // Typography
  typography: {
    fonts: {
      heading: 'font-playfair',
      body: 'font-inter',
    },
    sizes: {
      xs: 'text-xs',
      sm: 'text-sm', 
      base: 'text-base',
      lg: 'text-lg',
      xl: 'text-xl',
      '2xl': 'text-2xl',
      '3xl': 'text-3xl',
      '4xl': 'text-4xl',
    },
    weights: {
      normal: 'font-normal',
      medium: 'font-medium',
      semibold: 'font-semibold',
      bold: 'font-bold',
    }
  },

  // Spacing & Layout
  spacing: {
    // Consistent padding for components
    component: {
      sm: 'p-4',
      md: 'p-6', 
      lg: 'p-8',
      xl: 'p-10',
    },
    // Button padding
    button: {
      sm: 'px-4 py-2',
      md: 'px-6 py-3',
      lg: 'px-8 py-4',
    },
    // Gaps between elements
    gap: {
      sm: 'gap-2',
      md: 'gap-4',
      lg: 'gap-6',
      xl: 'gap-8',
    }
  },

  // Effects & Animations
  effects: {
    // Backdrop blur for glass morphism
    blur: {
      sm: 'backdrop-blur-sm',
      md: 'backdrop-blur-md',
      lg: 'backdrop-blur-lg',
      xl: 'backdrop-blur-xl',
    },
    
    // Shadows - lighter and more subtle
    shadows: {
      glass: 'shadow-lg shadow-white/5',
      button: 'shadow-md shadow-white/10',
      accent: 'shadow-lg shadow-blue-400/10',
      strong: 'shadow-xl shadow-white/10',
    },
    
    // Transitions
    transitions: {
      default: 'transition-all duration-300',
      fast: 'transition-all duration-200',
      slow: 'transition-all duration-500',
    },
    
    // Hover effects
    hover: {
      scale: 'hover:scale-[1.02] active:scale-[0.98]',
      subtle: 'hover:scale-105',
    }
  },

  // Border Radius
  radius: {
    sm: 'rounded-lg',
    md: 'rounded-xl', 
    lg: 'rounded-2xl',
    xl: 'rounded-3xl',
    full: 'rounded-full',
  },

  // Component Patterns
  patterns: {
    // Transparent glass panel (main container style)
    glassPanel: `
      bg-white/10 backdrop-blur-xl border border-white/20 rounded-3xl 
      shadow-xl shadow-white/10 relative overflow-hidden
    `,
    
    // Transparent glass button (primary button style)
    glassButton: `
      bg-white/10 backdrop-blur-md border border-white/20
      hover:bg-white/15 hover:border-white/30 text-white/90 hover:text-white
      rounded-xl transition-all duration-300 font-inter
      shadow-md shadow-white/10
    `,
    
    // Accent button (for important actions) - more transparent
    accentButton: `
      bg-gradient-to-r from-blue-400/30 to-purple-400/30
      hover:from-blue-400/40 hover:to-purple-400/40 text-white rounded-xl 
      transition-all duration-300 font-inter font-medium
      shadow-lg shadow-blue-400/10 backdrop-blur-md
      border border-white/25
    `,
    
    // Icon container - more transparent
    iconContainer: `
      bg-white/15 backdrop-blur-md rounded-2xl flex items-center justify-center
      border border-white/25 shadow-lg shadow-white/10
      relative overflow-hidden
    `,
    
    // Inner glow overlay for containers - very subtle
    innerGlow: `
      absolute inset-0 bg-gradient-to-br from-white/10 via-transparent to-transparent 
      rounded-3xl pointer-events-none
    `,
    
    // Input field - transparent
    inputField: `
      bg-white/8 backdrop-blur-md border border-white/20 rounded-xl 
      text-white placeholder-white/60 focus:outline-none focus:ring-2 
      focus:ring-white/30 focus:border-white/40 transition-all duration-300
    `,
  }
};

// Helper functions for consistent styling
export const getButtonStyle = (variant: 'glass' | 'accent' | 'danger' = 'glass', size: 'sm' | 'md' | 'lg' = 'md') => {
  const baseStyle = designSystem.effects.transitions.default;
  const sizeStyle = designSystem.spacing.button[size];
  const variantStyle = variant === 'glass' ? designSystem.patterns.glassButton :
                      variant === 'accent' ? designSystem.patterns.accentButton :
                      designSystem.colors.buttons.danger;
  
  return `${baseStyle} ${sizeStyle} ${variantStyle}`;
};

export const getPanelStyle = (blur: 'sm' | 'md' | 'lg' | 'xl' = 'xl') => {
  return designSystem.patterns.glassPanel.replace('backdrop-blur-xl', designSystem.effects.blur[blur]);
};