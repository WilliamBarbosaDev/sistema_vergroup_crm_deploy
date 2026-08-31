import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickCreateDrawer } from './components/common/QuickCreateDrawer';
import { DealDetailDrawer } from './components/crm/DealDetailDrawer';
import { RightChatWidgetRail } from './components/common/RightChatWidgetRail';
import { LoginView } from './components/auth/LoginView';

// Views
import { CockpitView } from './components/dashboard/CockpitView';
import { DealsPipelineView } from './components/crm/DealsPipelineView';
import { LeadsView } from './components/crm/LeadsView';
import { ContactsView } from './components/crm/ContactsView';
import { CompaniesView } from './components/crm/CompaniesView';
import { ClientsPipelineView } from './components/clients/ClientsPipelineView';
import { TasksView } from './components/work/TasksView';
import { ProjectsView } from './components/work/ProjectsView';
import { CalendarView } from './components/work/CalendarView';
import { InternalChatView } from './components/communication/InternalChatView';
import { EmailInboxView } from './components/communication/EmailInboxView';
import { WhatsAppSupportView } from './components/communication/WhatsAppSupportView';
import { AnalyticsView } from './components/management/AnalyticsView';
import { AutomationsView } from './components/management/AutomationsView';
import { AuditView } from './components/management/AuditView';
import { AdminView } from './components/admin/AdminView';

const MainLayout: React.FC = () => {
  const { currentTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'cockpit':
        return <CockpitView />;
      case 'crm-deals':
        return <DealsPipelineView />;
      case 'crm-leads':
        return <LeadsView />;
      case 'crm-[#17212B]':
      case 'crm-contacts':
        return <ContactsView />;
      case 'crm-companies':
        return <CompaniesView />;
      case 'clients-pipeline':
        return <ClientsPipelineView />;
      case 'work-tasks':
        return <TasksView />;
      case 'work-projects':
        return <ProjectsView />;
      case 'work-calendar':
        return <CalendarView />;
      case 'comms-chat':
      case 'comm-chat':
        return <InternalChatView />;
      case 'comms-email':
      case 'comm-email':
        return <EmailInboxView />;
      case 'comms-whatsapp':
      case 'comm-whatsapp':
        return <WhatsAppSupportView />;
      case 'mgmt-analytics':
      case 'manage-analytics':
        return <AnalyticsView />;
      case 'mgmt-automations':
      case 'manage-automations':
        return <AutomationsView />;
      case 'mgmt-[#17212B]':
      case 'mgmt-audit':
      case 'manage-audit':
        return <AuditView />;
      case 'admin-org':
      case 'admin-units':
      case 'admin-users':
      case 'admin-security':
        return <AdminView />;
      default:
        return <CockpitView />;
    }
  };

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F7F9FA] text-[#17212B] font-sans antialiased">
      {/* Dynamic Sidebar */}
      <Sidebar />

      {/* Main Container with pr-16 to preserve space for RightChatWidgetRail */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden pr-16">
        {/* Top Header */}
        <Header />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderContent()}
        </main>
      </div>

      {/* Modals, Floating Right Rail and Side Drawers */}
      <GlobalSearchModal />
      <QuickCreateDrawer />
      <DealDetailDrawer />
      <RightChatWidgetRail />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainLayout />
    </AppProvider>
  );
}
