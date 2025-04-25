
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AppProvider } from "./contexts/AppContext";

// Pages
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";

// Components
import Register from "./components/Register";
import Login from "./components/Login";
import Layout from "./components/Layout";
import Dashboard from "./components/Dashboard";
import Elections from "./components/Elections";
import ManageElections from "./components/ManageElections";
import VotingPage from "./components/VotingPage";
import Results from "./components/Results";
import CandidateApplications from "./components/CandidateApplications";
import ElectionDetails from "./components/ElectionDetails";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <AppProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/register" element={<Register />} />
            <Route path="/login" element={<Login />} />
            
            {/* Protected Routes */}
            <Route path="/dashboard" element={
              <Layout>
                <Dashboard />
              </Layout>
            } />
            <Route path="/elections" element={
              <Layout>
                <Elections />
              </Layout>
            } />
            <Route path="/manage-elections" element={
              <Layout>
                <ManageElections />
              </Layout>
            } />
            <Route path="/vote" element={
              <Layout>
                <VotingPage />
              </Layout>
            } />
            <Route path="/results" element={
              <Layout>
                <Results />
              </Layout>
            } />
            <Route path="/my-applications" element={
              <Layout>
                <CandidateApplications />
              </Layout>
            } />
            <Route path="/election-details" element={
              <Layout>
                <ElectionDetails />
              </Layout>
            } />
            
            {/* Catch-all */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </AppProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
