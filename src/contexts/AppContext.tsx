import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Define types
export interface User {
  id: string;
  email: string;
  password?: string;
  name?: string | null;  // Made optional
  role?: "admin" | "voter" | "candidate";  // Made optional
}

export interface Election {
  id: string;
  title: string;
  description: string;
  status: "upcoming" | "active" | "completed";
  startDate: string;
  endDate: string;
  candidates: string[];
}

export interface Candidate {
  id: string;
  userId: string;
  name: string | null;
  electionId: string;
  position: string;
  votes: number;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
}

// Type for the context
interface AppContextType {
  users: User[];
  currentUser: User | null;
  elections: Election[];
  candidates: Candidate[];
  votes: Vote[];
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  register: (email: string, password: string, name: string, role: "voter" | "candidate") => Promise<boolean>;
  addElection: (title: string, description: string, startDate: string, endDate: string) => void;
  updateElectionStatus: (id: string, status: "upcoming" | "active" | "completed") => void;
  applyForElection: (userId: string, electionId: string, position: string) => boolean;
  castVote: (electionId: string, candidateId: string, voterId: string) => boolean;
  hasVoted: (electionId: string, voterId: string) => boolean;
  getElectionResults: (electionId: string) => Candidate[];
}

const AppContext = createContext<AppContextType>({
  users: [],
  currentUser: null,
  elections: [],
  candidates: [],
  votes: [],
  login: async () => false,
  logout: async () => {},
  register: async () => false,
  addElection: () => {},
  updateElectionStatus: () => {},
  applyForElection: () => false,
  castVote: () => false,
  hasVoted: () => false,
  getElectionResults: () => [],
});

export const AppProvider: React.FC<{ children: React.ReactNode; onLogout?: () => void }> = ({ 
  children, 
  onLogout 
}) => {
  const [users, setUsers] = useState<User[]>([]);
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [elections, setElections] = useState<Election[]>([]);
  const [candidates, setCandidates] = useState<Candidate[]>([]);
  const [votes, setVotes] = useState<Vote[]>([]);

  // Update auth state listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (session?.user) {
          const { data: userData, error } = await supabase
            .from('users')
            .select('*')
            .eq('user_id', session.user.id)
            .single();
            
          if (userData) {
            setCurrentUser(userData);
          }
        } else {
          setCurrentUser(null);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from('users')
          .select('*')
          .eq('user_id', session.user.id)
          .single()
          .then(({ data: userData }) => {
            if (userData) {
              setCurrentUser(userData);
            }
          });
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Fetch data when user logs in
  useEffect(() => {
    const fetchData = async () => {
      if (currentUser) {
        // Fetch elections
        const { data: electionsData } = await supabase
          .from('elections')
          .select('*');
        if (electionsData) setElections(electionsData);

        // Fetch candidates
        const { data: candidatesData } = await supabase
          .from('candidates')
          .select('*');
        if (candidatesData) setCandidates(candidatesData);

        // Fetch votes if admin or relevant to user
        const { data: votesData } = await supabase
          .from('votes')
          .select('*');
        if (votesData) setVotes(votesData);

        // Fetch users if admin
        if (currentUser.role === 'admin') {
          const { data: usersData } = await supabase
            .from('users')
            .select('*');
          if (usersData) setUsers(usersData);
        }
      }
    };

    fetchData();
  }, [currentUser]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      toast.success('Login successful');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      setCurrentUser(null);
      if (onLogout) {
        onLogout();
      }
      toast.success('Logged out successfully');
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const register = async (email: string, password: string, name: string, role: "voter" | "candidate") => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      });

      if (error) throw error;
      toast.success('Registration successful. Please check your email for verification.');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const addElection = async (title: string, description: string, startDate: string, endDate: string) => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .insert({
          title,
          description,
          start_date: startDate,
          end_date: endDate,
          status: 'upcoming',
          created_by: currentUser?.id
        })
        .select()
        .single();

      if (error) throw error;
      setElections(prev => [...prev, data]);
      toast.success("Election created successfully");
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const updateElectionStatus = async (id: string, status: "upcoming" | "active" | "completed") => {
    try {
      const { data, error } = await supabase
        .from('elections')
        .update({ status })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      setElections(prev => prev.map(election => 
        election.id === id ? { ...election, status } : election
      ));
      toast.success(`Election status updated to ${status}`);
    } catch (error: any) {
      toast.error(error.message);
    }
  };

  const applyForElection = async (userId: string, electionId: string, position: string) => {
    try {
      const { data, error } = await supabase
        .from('candidates')
        .insert({
          user_id: userId,
          election_id: electionId,
          position
        })
        .select()
        .single();

      if (error) throw error;
      setCandidates(prev => [...prev, data]);
      toast.success('Applied for election successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const castVote = async (electionId: string, candidateId: string, voterId: string) => {
    try {
      const { data, error } = await supabase
        .from('votes')
        .insert({
          election_id: electionId,
          candidate_id: candidateId,
          voter_id: voterId
        })
        .select()
        .single();

      if (error) throw error;
      setVotes(prev => [...prev, data]);
      
      // Update candidate votes count
      await supabase.rpc('increment_candidate_votes', { candidate_id: candidateId });
      
      toast.success('Vote cast successfully');
      return true;
    } catch (error: any) {
      toast.error(error.message);
      return false;
    }
  };

  const hasVoted = (electionId: string, voterId: string) => {
    return votes.some((v) => v.election_id === electionId && v.voter_id === voterId);
  };

  const getElectionResults = (electionId: string) => {
    return candidates
      .filter((c) => c.election_id === electionId)
      .sort((a, b) => b.votes - a.votes);
  };

  const contextValue = {
    users,
    currentUser,
    elections,
    candidates,
    votes,
    login,
    logout,
    register,
    addElection,
    updateElectionStatus,
    applyForElection,
    castVote,
    hasVoted,
    getElectionResults,
  };

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export const useApp = () => useContext(AppContext);
