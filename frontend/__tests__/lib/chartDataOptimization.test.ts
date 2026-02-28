/**
 * Unit tests for chart data optimization utilities
 * 
 * Tests the sampling and aggregation functions for optimizing chart data points
 * on mobile devices.
 * 
 * Требование 10.2: Оптимизация количества отрисовываемых точек данных
 */

import {
  sampleDataPoints,
  aggregateDataPoints,
  optimizeChartData,
  optimizeGenericData,
  shouldOptimizeData,
  type DataPoint,
} from '@/lib/chartDataOptimization';

describe('chartDataOptimization', () => {
  describe('sampleDataPoints', () => {
    it('should return original data when length is less than maxPoints', () => {
      const data: DataPoint[] = [
        { date: '2024-01-01', amount: 100 },
        { date: '2024-01-02', amount: 150 },
        { date: '2024-01-03', amount: 120 },
      ];

      const result = sampleDataPoints(data, 10);
      expect(result).toEqual(data);
      expect(result.length).toBe(3);
    });

    it('should return empty array when data is empty', () => {
      const result = sampleDataPoints([], 10);
      expect(result).toEqual([]);
    });

    it('should sample data points evenly when length exceeds maxPoints', () => {
      const data: DataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i * 10,
      }));

      const result = sampleDataPoints(data, 20);
      
      expect(result.length).toBe(20);
      // Should include first point
      expect(result[0]).toEqual(data[0]);
      // Should include last point
      expect(result[result.length - 1]).toEqual(data[data.length - 1]);
    });

    it('should maintain chronological order', () => {
      const data: DataPoint[] = Array.from({ length: 50 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i * 10,
      }));

      const result = sampleDataPoints(data, 10);
      
      // Check that dates are in order
      for (let i = 1; i < result.length; i++) {
        expect(result[i].date >= result[i - 1].date).toBe(true);
      }
    });
  });

  describe('aggregateDataPoints', () => {
    it('should return original data when length is less than maxPoints', () => {
      const data: DataPoint[] = [
        { date: '2024-01-01', amount: 100 },
        { date: '2024-01-02', amount: 150 },
      ];

      const result = aggregateDataPoints(data, 10);
      expect(result).toEqual(data);
    });

    it('should aggregate data points by averaging', () => {
      const data: DataPoint[] = [
        { date: '2024-01-01', amount: 100 },
        { date: '2024-01-02', amount: 200 },
        { date: '2024-01-03', amount: 150 },
        { date: '2024-01-04', amount: 250 },
      ];

      const result = aggregateDataPoints(data, 2);
      
      expect(result.length).toBe(2);
      // First bucket: average of 100 and 200 = 150
      expect(result[0].amount).toBe(150);
      expect(result[0].date).toBe('2024-01-01');
      // Second bucket: average of 150 and 250 = 200
      expect(result[1].amount).toBe(200);
      expect(result[1].date).toBe('2024-01-03');
    });

    it('should round aggregated amounts to 2 decimal places', () => {
      const data: DataPoint[] = [
        { date: '2024-01-01', amount: 100.333 },
        { date: '2024-01-02', amount: 200.666 },
        { date: '2024-01-03', amount: 150.111 },
      ];

      const result = aggregateDataPoints(data, 1);
      
      expect(result.length).toBe(1);
      // Average: (100.333 + 200.666 + 150.111) / 3 = 150.37
      expect(result[0].amount).toBe(150.37);
    });
  });

  describe('optimizeChartData', () => {
    it('should not optimize when data length is below threshold (50)', () => {
      const data: DataPoint[] = Array.from({ length: 40 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i * 10,
      }));

      const result = optimizeChartData(data, true, false);
      expect(result).toEqual(data);
      expect(result.length).toBe(40);
    });

    it('should optimize to 20 points on mobile when data exceeds threshold', () => {
      const data: DataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i * 10,
      }));

      const result = optimizeChartData(data, true, false); // isMobile = true
      expect(result.length).toBe(20);
    });

    it('should optimize to 40 points on tablet when data exceeds threshold', () => {
      const data: DataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i * 10,
      }));

      const result = optimizeChartData(data, false, true); // isTablet = true
      expect(result.length).toBe(40);
    });

    it('should not optimize on desktop when data is below 100 points', () => {
      const data: DataPoint[] = Array.from({ length: 80 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i * 10,
      }));

      const result = optimizeChartData(data, false, false); // desktop
      expect(result).toEqual(data);
      expect(result.length).toBe(80);
    });

    it('should use aggregation when useAggregation is true', () => {
      const data: DataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: i * 10,
      }));

      const sampledResult = optimizeChartData(data, true, false, false);
      const aggregatedResult = optimizeChartData(data, true, false, true);
      
      // Both should have same length
      expect(sampledResult.length).toBe(20);
      expect(aggregatedResult.length).toBe(20);
      
      // But different values (aggregation averages, sampling picks specific points)
      expect(sampledResult[1].amount).not.toBe(aggregatedResult[1].amount);
    });
  });

  describe('optimizeGenericData', () => {
    interface TestCategory {
      name: string;
      value: number;
    }

    it('should optimize generic data structures', () => {
      const data: TestCategory[] = Array.from({ length: 100 }, (_, i) => ({
        name: `Category ${i}`,
        value: i * 10,
      }));

      const result = optimizeGenericData(data, true, false); // mobile
      expect(result.length).toBe(20);
      expect(result[0].name).toBe('Category 0');
      expect(result[result.length - 1].name).toBe('Category 99');
    });

    it('should not optimize when data is below threshold', () => {
      const data: TestCategory[] = Array.from({ length: 30 }, (_, i) => ({
        name: `Category ${i}`,
        value: i * 10,
      }));

      const result = optimizeGenericData(data, true, false);
      expect(result).toEqual(data);
    });

    it('should work with different data types', () => {
      interface ComplexData {
        id: string;
        nested: { value: number };
        array: number[];
      }

      const data: ComplexData[] = Array.from({ length: 100 }, (_, i) => ({
        id: `id-${i}`,
        nested: { value: i },
        array: [i, i * 2],
      }));

      const result = optimizeGenericData(data, true, false);
      expect(result.length).toBe(20);
      expect(result[0].id).toBe('id-0');
      expect(result[0].nested.value).toBe(0);
    });
  });

  describe('shouldOptimizeData', () => {
    it('should return false when data length is below threshold', () => {
      expect(shouldOptimizeData(30, true, false)).toBe(false);
      expect(shouldOptimizeData(50, true, false)).toBe(false);
    });

    it('should return true on mobile when data exceeds mobile max (20)', () => {
      expect(shouldOptimizeData(60, true, false)).toBe(true);
      expect(shouldOptimizeData(100, true, false)).toBe(true);
    });

    it('should return true on tablet when data exceeds tablet max (40)', () => {
      expect(shouldOptimizeData(60, false, true)).toBe(true);
      expect(shouldOptimizeData(100, false, true)).toBe(true);
    });

    it('should return false on tablet when data is below tablet max', () => {
      // 55 points is above threshold (50) but above tablet max (40), so it should optimize
      expect(shouldOptimizeData(55, false, true)).toBe(true);
      // 35 points is below threshold, so no optimization
      expect(shouldOptimizeData(35, false, true)).toBe(false);
    });

    it('should return true on desktop when data exceeds desktop max (100)', () => {
      expect(shouldOptimizeData(150, false, false)).toBe(true);
    });

    it('should return false on desktop when data is below desktop max', () => {
      expect(shouldOptimizeData(80, false, false)).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('should handle null/undefined data gracefully', () => {
      expect(sampleDataPoints(null as any, 10)).toEqual(null);
      expect(aggregateDataPoints(undefined as any, 10)).toEqual(undefined);
      expect(optimizeChartData(null as any, true, false)).toEqual(null);
    });

    it('should handle single data point', () => {
      const data: DataPoint[] = [{ date: '2024-01-01', amount: 100 }];
      
      expect(sampleDataPoints(data, 10)).toEqual(data);
      expect(aggregateDataPoints(data, 10)).toEqual(data);
      expect(optimizeChartData(data, true, false)).toEqual(data);
    });

    it('should handle maxPoints of 2', () => {
      const data: DataPoint[] = [
        { date: '2024-01-01', amount: 100 },
        { date: '2024-01-02', amount: 200 },
        { date: '2024-01-03', amount: 300 },
      ];

      const result = sampleDataPoints(data, 2);
      expect(result.length).toBe(2);
      // Should include first and last
      expect(result[0]).toEqual(data[0]);
      expect(result[1]).toEqual(data[2]);
    });

    it('should handle data with negative amounts', () => {
      const data: DataPoint[] = [
        { date: '2024-01-01', amount: -100 },
        { date: '2024-01-02', amount: -200 },
        { date: '2024-01-03', amount: 150 },
        { date: '2024-01-04', amount: -50 },
      ];

      const result = aggregateDataPoints(data, 2);
      expect(result.length).toBe(2);
      // First bucket: (-100 + -200) / 2 = -150
      expect(result[0].amount).toBe(-150);
    });

    it('should handle data with zero amounts', () => {
      const data: DataPoint[] = Array.from({ length: 100 }, (_, i) => ({
        date: `2024-01-${String(i + 1).padStart(2, '0')}`,
        amount: 0,
      }));

      const result = optimizeChartData(data, true, false);
      expect(result.length).toBe(20);
      expect(result.every(point => point.amount === 0)).toBe(true);
    });
  });
});
