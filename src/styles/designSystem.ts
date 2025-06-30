// Design System Guide - The Mindboat
// Based on the beautiful glass morphism and ocean theme

export const designSystem = {
  // Color Palette
  colors: {
    // Glass morphism backgrounds
    glass: {
      primary: 'bg-gradient-to-br from-blue-400/20 via-blue-300/15 to-blue-500/25',
      secondary: 'bg-gradient-to-br from-white/15 via-white/10 to-white/5',
      overlay: 'bg-gradient-to-br from-white/10 via-transparent to-transparent',
    },
    
    // Button styles
    buttons: {
      // Subtle glass button (primary style)
      glass: 'bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/30 text-white/80 hover:text-white',
      // Accent button for important actions
      accent: 'bg-gradient-to-r from-blue-500/80 to-purple-500/80 hover:from-blue-500 hover:to-purple-500 text-white border border-white/20',
      // Danger/warning button
      danger: 'bg-gradient-to-r from-red-400/60 to-red-600/60 border-red-300/50 text-white',
    },
    
    // Text colors
    text: {
      primary: 'text-white',
      secondary: 'text-white/90',
      muted: 'text-white/70',
      subtle: 'text-white/60',
    },
    
    // Border colors
    borders: {
      glass: 'border-white/20',
      glassHover: 'border-white/30',
      accent: 'border-blue-400/50',
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
    
    // Shadows
    shadows: {
      glass: 'shadow-lg shadow-blue-500/10',
      button: 'shadow-md shadow-white/5 hover:shadow-white/10',
      accent: 'shadow-lg shadow-blue-500/20',
      strong: 'shadow-2xl shadow-blue-500/20',
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
    // Glass panel (main container style)
    glassPanel: `
      bg-gradient-to-br from-blue-400/20 via-blue-300/15 to-blue-500/25 
      backdrop-blur-xl border border-white/30 rounded-3xl 
      shadow-2xl shadow-blue-500/20 relative overflow-hidden
    `,
    
    // Glass button (primary button style)
    glassButton: `
      bg-white/10 backdrop-blur-md border border-white/20
      hover:bg-white/20 hover:border-white/30 text-white/80 hover:text-white
      rounded-xl transition-all duration-300 font-inter
      shadow-md shadow-white/5 hover:shadow-white/10
    `,
    
    // Accent button (for important actions)
    accentButton: `
      bg-gradient-to-r from-blue-500/80 to-purple-500/80
      hover:from-blue-500 hover:to-purple-500 text-white rounded-xl 
      transition-all duration-300 font-inter font-medium
      shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50
      border border-white/20
    `,
    
    // Icon container
    iconContainer: `
      bg-gradient-to-br from-blue-400/40 to-blue-600/40 
      rounded-2xl flex items-center justify-center backdrop-blur-md 
      border border-white/40 shadow-lg shadow-blue-500/20
      relative overflow-hidden
    `,
    
    // Inner glow overlay for containers
    innerGlow: `
      absolute inset-0 bg-gradient-to-br from-white/20 via-transparent to-transparent 
      rounded-3xl pointer-events-none
    `,
    
    // Input field
    inputField: `
      bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl 
      text-white placeholder-white/50 focus:outline-none focus:ring-2 
      focus:ring-blue-400/50 focus:border-blue-400/50 transition-all duration-300
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