export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          email: string;
          full_name: string | null;
          avatar_url: string | null;
          role: "admin" | "operator" | "viewer";
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          email: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "operator" | "viewer";
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          email?: string;
          full_name?: string | null;
          avatar_url?: string | null;
          role?: "admin" | "operator" | "viewer";
          created_at?: string;
          updated_at?: string;
        };
      };
      devices: {
        Row: {
          id: string;
          user_id: string | null;
          device_name: string;
          device_id: string;
          device_uid: string; // compatibility alias
          api_key_hash: string;
          status: "online" | "offline" | "warning" | "fault";
          last_seen: string | null;
          last_seen_at: string | null;
          firmware_version: string;
          offline_timeout_seconds: number;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id?: string | null;
          device_name: string;
          device_id?: string;
          device_uid?: string;
          api_key_hash: string;
          status?: "online" | "offline" | "warning" | "fault";
          last_seen?: string | null;
          last_seen_at?: string | null;
          firmware_version?: string;
          offline_timeout_seconds?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string | null;
          device_name?: string;
          device_id?: string;
          device_uid?: string;
          api_key_hash?: string;
          status?: "online" | "offline" | "warning" | "fault";
          last_seen?: string | null;
          last_seen_at?: string | null;
          firmware_version?: string;
          offline_timeout_seconds?: number;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      telemetry: {
        Row: {
          id: string;
          device_id: string;
          timestamp: string;
          ph: number | null;
          turbidity_raw: number | null;
          turbidity_ntu: number | null;
          water_level_raw: number | null;
          water_level_percent: number | null;
          flow_pulses: number | null;
          flow_lpm: number | null;
          accumulated_volume_liters: number | null;
          dissolved_oxygen_mg_l: number | null;
          received_at: string;
          raw_payload: Json | null;
        };
        Insert: {
          id?: string;
          device_id: string;
          timestamp: string;
          ph?: number | null;
          turbidity_raw?: number | null;
          turbidity_ntu?: number | null;
          water_level_raw?: number | null;
          water_level_percent?: number | null;
          flow_pulses?: number | null;
          flow_lpm?: number | null;
          accumulated_volume_liters?: number | null;
          dissolved_oxygen_mg_l?: number | null;
          received_at?: string;
          raw_payload?: Json | null;
        };
        Update: {
          id?: string;
          device_id?: string;
          timestamp?: string;
          ph?: number | null;
          turbidity_raw?: number | null;
          turbidity_ntu?: number | null;
          water_level_raw?: number | null;
          water_level_percent?: number | null;
          flow_pulses?: number | null;
          flow_lpm?: number | null;
          accumulated_volume_liters?: number | null;
          dissolved_oxygen_mg_l?: number | null;
          received_at?: string;
          raw_payload?: Json | null;
        };
      };
      calibrations: {
        Row: {
          id: string;
          device_id: string;
          sensor: "ph" | "turbidity" | "water_level" | "flow";
          calibration_data: Json;
          calibration_status: "UNCALIBRATED" | "CALIBRATED" | "CALIBRATION_REQUIRED";
          calibrated_at: string | null;
          version: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          sensor: "ph" | "turbidity" | "water_level" | "flow";
          calibration_data?: Json;
          calibration_status?: "UNCALIBRATED" | "CALIBRATED" | "CALIBRATION_REQUIRED";
          calibrated_at?: string | null;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          sensor?: "ph" | "turbidity" | "water_level" | "flow";
          calibration_data?: Json;
          calibration_status?: "UNCALIBRATED" | "CALIBRATED" | "CALIBRATION_REQUIRED";
          calibrated_at?: string | null;
          version?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      sensor_readings: {
        Row: {
          id: string;
          device_id: string;
          recorded_at: string;
          ph: number | null;
          turbidity: number | null;
          flow_rate: number | null;
          total_flow: number | null;
          dissolved_oxygen: number | null;
          do_calculation_meta: Json | null;
          raw_payload: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          recorded_at: string;
          ph?: number | null;
          turbidity?: number | null;
          flow_rate?: number | null;
          total_flow?: number | null;
          dissolved_oxygen?: number | null;
          do_calculation_meta?: Json | null;
          raw_payload: Json;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          recorded_at?: string;
          ph?: number | null;
          turbidity?: number | null;
          flow_rate?: number | null;
          total_flow?: number | null;
          dissolved_oxygen?: number | null;
          do_calculation_meta?: Json | null;
          raw_payload?: Json;
          created_at?: string;
        };
      };
      thresholds: {
        Row: {
          id: string;
          user_id: string;
          parameter: "ph" | "turbidity" | "water_level" | "flow_rate" | "dissolved_oxygen";
          minimum_value: number;
          maximum_value: number;
          warning_low: number | null;
          warning_high: number | null;
          critical_low: number | null;
          critical_high: number | null;
          enabled: boolean;
          unit: string;
          notes: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          parameter: "ph" | "turbidity" | "water_level" | "flow_rate" | "dissolved_oxygen";
          minimum_value: number;
          maximum_value: number;
          warning_low?: number | null;
          warning_high?: number | null;
          critical_low?: number | null;
          critical_high?: number | null;
          enabled?: boolean;
          unit: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          parameter?: "ph" | "turbidity" | "water_level" | "flow_rate" | "dissolved_oxygen";
          minimum_value?: number;
          maximum_value?: number;
          warning_low?: number | null;
          warning_high?: number | null;
          critical_low?: number | null;
          critical_high?: number | null;
          enabled?: boolean;
          unit?: string;
          notes?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      alerts: {
        Row: {
          id: string;
          user_id: string;
          device_id: string;
          sensor_id: string | null;
          parameter: string;
          severity: "INFO" | "WARNING" | "CRITICAL";
          alert_type: string;
          current_value: number | null;
          threshold_value: number | null;
          message: string;
          status: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
          dedup_key: string;
          occurrence_count: number;
          last_occurred_at: string;
          created_at: string;
          acknowledged_at: string | null;
          resolved_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          device_id: string;
          sensor_id?: string | null;
          parameter: string;
          severity: "INFO" | "WARNING" | "CRITICAL";
          alert_type: string;
          current_value?: number | null;
          threshold_value?: number | null;
          message: string;
          status?: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
          dedup_key: string;
          occurrence_count?: number;
          last_occurred_at?: string;
          created_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          device_id?: string;
          sensor_id?: string | null;
          parameter?: string;
          severity?: "INFO" | "WARNING" | "CRITICAL";
          alert_type?: string;
          current_value?: number | null;
          threshold_value?: number | null;
          message?: string;
          status?: "ACTIVE" | "ACKNOWLEDGED" | "RESOLVED";
          dedup_key?: string;
          occurrence_count?: number;
          last_occurred_at?: string;
          created_at?: string;
          acknowledged_at?: string | null;
          resolved_at?: string | null;
        };
      };
      device_events: {
        Row: {
          id: string;
          device_id: string;
          event_type: string;
          message: string;
          metadata: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          device_id: string;
          event_type: string;
          message: string;
          metadata?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          device_id?: string;
          event_type?: string;
          message?: string;
          metadata?: Json | null;
          created_at?: string;
        };
      };
      export_jobs: {
        Row: {
          id: string;
          user_id: string;
          start_date: string;
          end_date: string;
          record_count: number;
          status: "pending" | "processing" | "completed" | "failed";
          file_name: string;
          created_at: string;
          completed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          start_date: string;
          end_date: string;
          record_count?: number;
          status?: "pending" | "processing" | "completed" | "failed";
          file_name: string;
          created_at?: string;
          completed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          start_date?: string;
          end_date?: string;
          record_count?: number;
          status?: "pending" | "processing" | "completed" | "failed";
          file_name?: string;
          created_at?: string;
          completed_at?: string | null;
        };
      };
    };
  };
}
