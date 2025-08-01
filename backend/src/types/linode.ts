// Linode API 类型定义

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

export interface CreateLinodeRequest {
  label: string;
  region: string;
  type: string;
  image?: string;
  root_pass?: string;
  authorized_keys?: string[];
  tags?: string[];
  group?: string;
  stackscript_id?: number;
  stackscript_data?: Record<string, any>;
  backup_id?: number;
  private_ip?: boolean;
  authorized_users?: string[];
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
  status?: string;
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
  deprecated?: boolean;
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

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export interface ErrorResponse {
  errors: Array<{
    field?: string;
    reason: string;
  }>;
} 