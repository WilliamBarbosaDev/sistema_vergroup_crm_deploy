import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar } from './components/common/Sidebar';
import { Header } from './components/common/Header';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';
import { QuickCreateDrawer } from './components/common/QuickCreateDrawer';
import { DealDetailDrawer } from './components/crm/DealDetailDrawer';
import { CollaboratorsSidebar } from './components/common/CollaboratorsSidebar';
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
import { FiscalModuleView } from './components/modules/fiscal/FiscalModuleView';

import { TaskCreateWorkspace } from './components/work/TaskCreateWorkspace';

const MainLayout: React.FC = () => {
  const { currentTab, isAuthenticated } = useApp();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  const renderContent = () => {
    switch (currentTab) {
      case 'mod-fiscal':
        return <FiscalModuleView />;
      case 'cockpit':
        return <CockpitView />;
      case 'crm-deals':
        return <DealsPipelineView />;
      case 'crm-leads':
        return <LeadsView />;
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
      {/* Dynamic Navigation Sidebar (Left) */}
      <Sidebar />

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <Header />

        {/* Scrollable Main Content */}
        <main className="flex-1 overflow-y-auto overflow-x-hidden">
          {renderContent()}
        </main>
      </div>

      {/* Collaborators & Team Presence Rail (Right, 52px width) */}
      <CollaboratorsSidebar />

      {/* Modals & Drawers */}
      <GlobalSearchModal />
      <QuickCreateDrawer />
      <DealDetailDrawer />
      <TaskCreateWorkspace />
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
