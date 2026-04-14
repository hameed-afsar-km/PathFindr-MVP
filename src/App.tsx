import { ERPProvider } from '@/context/ERPContext';
import ERPRouter from '@/pages/erp/ERPRouter';

/**
 * PathFindr ERP — Multi-Tenant SaaS Platform
 *
 * Architecture:
 *   ERPProvider  →  ERPRouter  →  AdminDashboard
 *                             →  InstituteDashboard
 *                             →  StudentERPWrapper → (original student app)
 *                             →  ERPLoginPage
 */
export default function App() {
  return (
    <ERPProvider>
      <ERPRouter />
    </ERPProvider>
  );
}
