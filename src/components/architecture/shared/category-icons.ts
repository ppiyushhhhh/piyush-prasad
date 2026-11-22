import {
  Server,
  Shield,
  Layers,
  Database,
  Globe,
  Activity,
  Cpu,
  HardDrive,
  Terminal,
  Bot,
} from "lucide-react";
import type { ArchitectureCategory } from "@/lib/architecture-diagrams";

export function getNodeCategoryIcon(category: ArchitectureCategory) {
  switch (category) {
    case "client":
    case "dns":
    case "cdn":
    case "networking":
      return Globe;
    case "security":
      return Shield;
    case "compute":
      return Server;
    case "application":
      return Cpu;
    case "database":
      return Database;
    case "storage":
      return HardDrive;
    case "monitoring":
      return Activity;
    case "cicd":
      return Terminal;
    case "ai":
      return Bot;
    default:
      return Layers;
  }
}
