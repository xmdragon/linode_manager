// Linode API 类型定义（前端）

export interface LinodeInstance {
  id: number;
  label: string;
  status: 'running' | 'offline' | 'booting' | 'rebooting' | 'shutting_down' | 'provisioning';
  region: string;
  type: string;
  ipv4: string[];
  ipv6: string | null;
  created: string;
  updated: string;
  hypervisor: string;
  watchdog_enabled: boolean;
  image: string | null;
  tags: string[];
  group: string;
  specs: {
    disk: number;
    memory: number;
    vcpus: number;
    transfer: number;
  };
}

export interface LinodeBackup {
  id: number;
  label: string;
  description: string;
  status: string;
  type: string;
  created: string;
  finished: string;
  configs: string[];
  disks: {
    id: number;
    label: string;
    size: number;
  }[];
}

export interface LinodeFirewall {
  id: number;
  label: string;
  status: string;
  rules: {
    inbound: LinodeFirewallRule[];
    outbound: LinodeFirewallRule[];
  };
  created: string;
  updated: string;
}

export interface LinodeFirewallRule {
  id: number;
  label: string;
  protocol: string;
  ports: string;
  addresses: {
    ipv4: string[];
    ipv6: string[];
  };
  action: 'ACCEPT' | 'DROP';
}

export interface LinodeUser {
  id: number;
  username: string;
  email: string;
  restricted: boolean;
  ssh_keys: string[];
  created: string;
  updated: string;
}

export interface CreateLinodeRequest {
  region: string;
  type: string;
  image: string;
  label: string;
  root_pass?: string;
  authorized_keys?: string[];
  authorized_users?: string[];
  stackscript_id?: number;
  backup_id?: number;
  firewall_id?: number;
  private_ip?: boolean;
  confirmPassword?: string; // 用于前端验证，不会发送到API
}

export interface LinodeRegion {
  id: string;
  label: string;
  country: string;
  capabilities: string[];
  status: string;
}

export interface LinodeType {
  id: string;
  label: string;
  price: {
    hourly: number;
    monthly: number;
  };
  addons: {
    backups: {
      price: {
        hourly: number;
        monthly: number;
      };
    };
  };
  network_out: number;
  memory: number;
  transfer: number;
  vcpus: number;
  disk: number;
  class: string;
  successor: string | null;
}

export interface LinodeImage {
  id: string;
  label: string;
  description: string;
  vendor: string;
  deprecated: boolean;
  size: number;
  type: string;
  is_public: boolean;
  created: string;
  created_by: string;
  expiry: string | null;
}

export interface LinodeSshKey {
  id: number;
  label: string;
  ssh_key: string;
  created: string;
}

export interface LinodeStackScript {
  id: number;
  username: string;
  label: string;
  description: string;
  ordinal: number;
  logo_url: string;
  images: string[];
  deployments_total: number;
  deployments_active: number;
  is_public: boolean;
  mine: boolean;
  created: string;
  updated: string;
  rev_note: string;
  script: string;
  user_defined_fields: any[];
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ServerListResponse extends ApiResponse<LinodeInstance[]> {}
export interface ServerDetailResponse extends ApiResponse<LinodeInstance> {}
export interface ServerActionResponse extends ApiResponse<void> {} 