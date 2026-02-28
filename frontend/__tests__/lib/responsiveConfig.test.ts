/**
 * Unit tests for ResponsiveConfig
 * 
 * Validates: Requirements 2.4, 9.3, 3.2, 3.4
 */

import {
  responsiveConfig,
  chartResponsiveConfig,
  getContainerSpacing,
  getCardSpacing,
  getGapSpacing,
  getHeadingTypography,
  getBodyTypography,
  getTouchTargetSize,
  getTouchTargetClasses,
  getChartConfig,
  getChartHeightClasses,
} from '@/lib/responsiveConfig';

describe('ResponsiveConfig', () => {
  describe('breakpoints', () => {
    it('should define all standard Tailwind breakpoints', () => {
      expect(responsiveConfig.breakpoints).toEqual({
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1440,
      });
    });

    it('should have breakpoints in ascending order', () => {
      const { sm, md, lg, xl } = responsiveConfig.breakpoints;
      expect(sm).toBeLessThan(md);
      expect(md).toBeLessThan(lg);
      expect(lg).toBeLessThan(xl);
      expect(xl).toBeLessThan(responsiveConfig.breakpoints['2xl']);
    });
  });

  describe('touchTargetSize', () => {
    it('should meet WCAG AAA minimum touch target size of 44px', () => {
      // Requirement 2.4: минимальная область касания 44x44px
      expect(responsiveConfig.touchTargetSize.minimum).toBe(44);
    });

    it('should define comfortable touch target size', () => {
      expect(responsiveConfig.touchTargetSize.comfortable).toBe(48);
    });

    it('should have comfortable size greater than minimum', () => {
      expect(responsiveConfig.touchTargetSize.comfortable).toBeGreaterThan(
        responsiveConfig.touchTargetSize.minimum
      );
    });
  });

  describe('spacing', () => {
    it('should define mobile spacing with 16px (px-4)', () => {
      // Requirement 1.4: минимальные отступы 16px по краям на мобильных
      expect(responsiveConfig.spacing.mobile.container).toBe('px-4');
      expect(responsiveConfig.spacing.mobile.card).toBe('p-4');
      expect(responsiveConfig.spacing.mobile.gap).toBe('gap-4');
    });

    it('should define tablet spacing with 24px (px-6)', () => {
      expect(responsiveConfig.spacing.tablet.container).toBe('sm:px-6');
      expect(responsiveConfig.spacing.tablet.card).toBe('sm:p-6');
      expect(responsiveConfig.spacing.tablet.gap).toBe('sm:gap-6');
    });

    it('should define desktop spacing with 32px (px-8)', () => {
      expect(responsiveConfig.spacing.desktop.container).toBe('lg:px-8');
      expect(responsiveConfig.spacing.desktop.card).toBe('lg:p-8');
      expect(responsiveConfig.spacing.desktop.gap).toBe('lg:gap-8');
    });

    it('should have consistent structure across all device sizes', () => {
      const { mobile, tablet, desktop } = responsiveConfig.spacing;
      
      expect(mobile).toHaveProperty('container');
      expect(mobile).toHaveProperty('card');
      expect(mobile).toHaveProperty('gap');
      
      expect(tablet).toHaveProperty('container');
      expect(tablet).toHaveProperty('card');
      expect(tablet).toHaveProperty('gap');
      
      expect(desktop).toHaveProperty('container');
      expect(desktop).toHaveProperty('card');
      expect(desktop).toHaveProperty('gap');
    });
  });

  describe('typography', () => {
    it('should define heading typography for mobile and desktop', () => {
      expect(responsiveConfig.typography.heading.mobile).toBe('text-2xl');
      expect(responsiveConfig.typography.heading.desktop).toBe('md:text-3xl');
    });

    it('should define body typography for mobile and desktop', () => {
      expect(responsiveConfig.typography.body.mobile).toBe('text-sm');
      expect(responsiveConfig.typography.body.desktop).toBe('md:text-base');
    });
  });

  describe('helper functions', () => {
    describe('getContainerSpacing', () => {
      it('should return combined container spacing classes', () => {
        const spacing = getContainerSpacing();
        expect(spacing).toContain('px-4');
        expect(spacing).toContain('sm:px-6');
        expect(spacing).toContain('lg:px-8');
      });

      it('should return a single string with all classes', () => {
        const spacing = getContainerSpacing();
        expect(typeof spacing).toBe('string');
        expect(spacing.split(' ')).toHaveLength(3);
      });
    });

    describe('getCardSpacing', () => {
      it('should return combined card spacing classes', () => {
        const spacing = getCardSpacing();
        expect(spacing).toContain('p-4');
        expect(spacing).toContain('sm:p-6');
        expect(spacing).toContain('lg:p-8');
      });

      it('should return a single string with all classes', () => {
        const spacing = getCardSpacing();
        expect(typeof spacing).toBe('string');
        expect(spacing.split(' ')).toHaveLength(3);
      });
    });

    describe('getGapSpacing', () => {
      it('should return combined gap spacing classes', () => {
        const spacing = getGapSpacing();
        expect(spacing).toContain('gap-4');
        expect(spacing).toContain('sm:gap-6');
        expect(spacing).toContain('lg:gap-8');
      });

      it('should return a single string with all classes', () => {
        const spacing = getGapSpacing();
        expect(typeof spacing).toBe('string');
        expect(spacing.split(' ')).toHaveLength(3);
      });
    });

    describe('getHeadingTypography', () => {
      it('should return combined heading typography classes', () => {
        const typography = getHeadingTypography();
        expect(typography).toContain('text-2xl');
        expect(typography).toContain('md:text-3xl');
      });

      it('should return a single string with all classes', () => {
        const typography = getHeadingTypography();
        expect(typeof typography).toBe('string');
        expect(typography.split(' ')).toHaveLength(2);
      });
    });

    describe('getBodyTypography', () => {
      it('should return combined body typography classes', () => {
        const typography = getBodyTypography();
        expect(typography).toContain('text-sm');
        expect(typography).toContain('md:text-base');
      });

      it('should return a single string with all classes', () => {
        const typography = getBodyTypography();
        expect(typeof typography).toBe('string');
        expect(typography.split(' ')).toHaveLength(2);
      });
    });

    describe('getTouchTargetSize', () => {
      it('should return minimum touch target size of 44px', () => {
        // Requirement 2.4, 9.3: минимальная область касания 44x44px
        expect(getTouchTargetSize()).toBe(44);
      });

      it('should return a number', () => {
        expect(typeof getTouchTargetSize()).toBe('number');
      });
    });

    describe('getTouchTargetClasses', () => {
      it('should return Tailwind classes for 44x44px minimum size', () => {
        const classes = getTouchTargetClasses();
        expect(classes).toContain('min-h-[44px]');
        expect(classes).toContain('min-w-[44px]');
      });

      it('should return a single string with both classes', () => {
        const classes = getTouchTargetClasses();
        expect(typeof classes).toBe('string');
        expect(classes.split(' ')).toHaveLength(2);
      });
    });
  });

  describe('configuration integrity', () => {
    it('should have all required top-level properties', () => {
      expect(responsiveConfig).toHaveProperty('breakpoints');
      expect(responsiveConfig).toHaveProperty('touchTargetSize');
      expect(responsiveConfig).toHaveProperty('spacing');
      expect(responsiveConfig).toHaveProperty('typography');
    });

    it('should export a frozen configuration object', () => {
      // Ensure configuration is immutable
      expect(() => {
        (responsiveConfig as any).breakpoints = {};
      }).toThrow();
    });
  });
});

describe('ChartResponsiveConfig', () => {
  describe('height', () => {
    it('should define minimum height of 256px for mobile', () => {
      // Requirement 3.2: минимальная высота графика 256px на мобильных
      expect(chartResponsiveConfig.height.mobile).toBe(256);
    });

    it('should define height of 320px for tablet', () => {
      expect(chartResponsiveConfig.height.tablet).toBe(320);
    });

    it('should define height of 384px for desktop', () => {
      expect(chartResponsiveConfig.height.desktop).toBe(384);
    });

    it('should have heights in ascending order', () => {
      const { mobile, tablet, desktop } = chartResponsiveConfig.height;
      expect(mobile).toBeLessThan(tablet);
      expect(tablet).toBeLessThan(desktop);
    });
  });

  describe('maxTicksLimit', () => {
    it('should define 5 ticks for mobile', () => {
      // Requirement 3.4: уменьшение количества меток для мобильных устройств
      expect(chartResponsiveConfig.maxTicksLimit.mobile).toBe(5);
    });

    it('should define 8 ticks for tablet', () => {
      expect(chartResponsiveConfig.maxTicksLimit.tablet).toBe(8);
    });

    it('should define 12 ticks for desktop', () => {
      expect(chartResponsiveConfig.maxTicksLimit.desktop).toBe(12);
    });

    it('should have tick limits in ascending order', () => {
      const { mobile, tablet, desktop } = chartResponsiveConfig.maxTicksLimit;
      expect(mobile).toBeLessThan(tablet);
      expect(tablet).toBeLessThan(desktop);
    });
  });

  describe('pointRadius', () => {
    it('should define point radius of 2px for mobile', () => {
      expect(chartResponsiveConfig.pointRadius.mobile).toBe(2);
    });

    it('should define point radius of 3px for tablet', () => {
      expect(chartResponsiveConfig.pointRadius.tablet).toBe(3);
    });

    it('should define point radius of 4px for desktop', () => {
      expect(chartResponsiveConfig.pointRadius.desktop).toBe(4);
    });

    it('should have point radius in ascending order', () => {
      const { mobile, tablet, desktop } = chartResponsiveConfig.pointRadius;
      expect(mobile).toBeLessThan(tablet);
      expect(tablet).toBeLessThan(desktop);
    });
  });

  describe('fontSize', () => {
    it('should define font size of 10px for mobile', () => {
      expect(chartResponsiveConfig.fontSize.mobile).toBe(10);
    });

    it('should define font size of 11px for tablet', () => {
      expect(chartResponsiveConfig.fontSize.tablet).toBe(11);
    });

    it('should define font size of 12px for desktop', () => {
      expect(chartResponsiveConfig.fontSize.desktop).toBe(12);
    });

    it('should have font sizes in ascending order', () => {
      const { mobile, tablet, desktop } = chartResponsiveConfig.fontSize;
      expect(mobile).toBeLessThan(tablet);
      expect(tablet).toBeLessThan(desktop);
    });
  });

  describe('configuration structure', () => {
    it('should have all required properties', () => {
      expect(chartResponsiveConfig).toHaveProperty('height');
      expect(chartResponsiveConfig).toHaveProperty('maxTicksLimit');
      expect(chartResponsiveConfig).toHaveProperty('pointRadius');
      expect(chartResponsiveConfig).toHaveProperty('fontSize');
    });

    it('should have mobile, tablet, and desktop keys for all properties', () => {
      const properties = ['height', 'maxTicksLimit', 'pointRadius', 'fontSize'] as const;
      
      properties.forEach(prop => {
        expect(chartResponsiveConfig[prop]).toHaveProperty('mobile');
        expect(chartResponsiveConfig[prop]).toHaveProperty('tablet');
        expect(chartResponsiveConfig[prop]).toHaveProperty('desktop');
      });
    });

    it('should export a frozen configuration object', () => {
      // Ensure configuration is immutable
      expect(() => {
        (chartResponsiveConfig as any).height = {};
      }).toThrow();
    });
  });

  describe('helper functions', () => {
    describe('getChartConfig', () => {
      it('should return mobile config when isMobile is true', () => {
        const config = getChartConfig(true, false);
        
        expect(config.height).toBe(chartResponsiveConfig.height.mobile);
        expect(config.maxTicksLimit).toBe(chartResponsiveConfig.maxTicksLimit.mobile);
        expect(config.pointRadius).toBe(chartResponsiveConfig.pointRadius.mobile);
        expect(config.fontSize).toBe(chartResponsiveConfig.fontSize.mobile);
      });

      it('should return tablet config when isTablet is true', () => {
        const config = getChartConfig(false, true);
        
        expect(config.height).toBe(chartResponsiveConfig.height.tablet);
        expect(config.maxTicksLimit).toBe(chartResponsiveConfig.maxTicksLimit.tablet);
        expect(config.pointRadius).toBe(chartResponsiveConfig.pointRadius.tablet);
        expect(config.fontSize).toBe(chartResponsiveConfig.fontSize.tablet);
      });

      it('should return desktop config when both flags are false', () => {
        const config = getChartConfig(false, false);
        
        expect(config.height).toBe(chartResponsiveConfig.height.desktop);
        expect(config.maxTicksLimit).toBe(chartResponsiveConfig.maxTicksLimit.desktop);
        expect(config.pointRadius).toBe(chartResponsiveConfig.pointRadius.desktop);
        expect(config.fontSize).toBe(chartResponsiveConfig.fontSize.desktop);
      });

      it('should prioritize mobile over tablet when both are true', () => {
        const config = getChartConfig(true, true);
        
        expect(config.height).toBe(chartResponsiveConfig.height.mobile);
      });

      it('should return an object with all required properties', () => {
        const config = getChartConfig(false, false);
        
        expect(config).toHaveProperty('height');
        expect(config).toHaveProperty('maxTicksLimit');
        expect(config).toHaveProperty('pointRadius');
        expect(config).toHaveProperty('fontSize');
      });
    });

    describe('getChartHeightClasses', () => {
      it('should return Tailwind classes for responsive chart height', () => {
        const classes = getChartHeightClasses();
        expect(classes).toContain('h-64');
        expect(classes).toContain('sm:h-80');
        expect(classes).toContain('lg:h-96');
      });

      it('should return a single string with all classes', () => {
        const classes = getChartHeightClasses();
        expect(typeof classes).toBe('string');
        expect(classes.split(' ')).toHaveLength(3);
      });
    });
  });
});
