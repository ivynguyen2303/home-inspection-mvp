import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import Landing from "@/pages/landing";
import Inspectors from "@/pages/inspectors";
import InspectorProfile from "@/pages/inspector-profile";
import PostRequest from "@/pages/PostRequest";
import RequestsList from "@/pages/RequestsList";
import RequestDetail from "@/pages/RequestDetail";
import InspectorDashboard from "@/pages/InspectorDashboard";
import Thanks from "@/pages/Thanks";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Landing} />
      <Route path="/inspectors" component={Inspectors} />
      <Route path="/inspectors/:id" component={InspectorProfile} />
      <Route path="/post" component={PostRequest} />
      <Route path="/requests" component={RequestsList} />
      <Route path="/requests/:id" component={RequestDetail} />
      <Route path="/inspector" component={InspectorDashboard} />
      <Route path="/thanks" component={Thanks} />
      {/* Fallback to 404 */}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
