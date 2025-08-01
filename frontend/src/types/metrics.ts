export interface MetricsData {
  cpu: CpuMetrics;
  disk: DiskMetrics;
  network: NetworkMetrics;
  memory: MemoryMetrics;
}

export interface CpuMetrics {
  percentage: number;
  history: MetricPoint[];
}

export interface DiskMetrics {
  io: number;
  swap: number;
  history: MetricPoint[];
}

export interface NetworkMetrics {
  ipv4: NetworkTraffic;
  ipv6: NetworkTraffic;
  transfer: TransferMetrics;
  history: MetricPoint[];
}

export interface NetworkTraffic {
  in: number;
  out: number;
  history: MetricPoint[];
}

export interface TransferMetrics {
  used: number;
  limit: number;
  remaining: number;
  history: MetricPoint[];
}

export interface MemoryMetrics {
  used: number;
  total: number;
  percentage: number;
  history: MetricPoint[];
}

export interface MetricPoint {
  timestamp: string;
  value: number;
}

export interface DnsResolver {
  ipv4: string;
  ipv6: string;
} 