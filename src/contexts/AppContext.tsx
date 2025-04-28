
import React, { createContext, useContext, useState, useEffect } from "react";
import { toast } from "sonner";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";

// Define types
export interface User {
  id: string;
  email: string | null;
  password?: string;
  name?: string | null;
  role: "admin" | "voter" | "candidate";
  user_id?: string;
}

export interface Election {
  id: string;
  title: string;
  description: string | null;
  status: "upcoming" | "active" | "completed";
  startDate: string;
  endDate: string;
  candidates: string[];
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}

export interface Candidate {
  id: string;
  userId: string;
  name: string | null;
  electionId: string;
  position: string;
  votes: number;
  created_at?: string;
  updated_at?: string;
}

export interface Vote {
  id: string;
  electionId: string;
  candidateId: string;
  voterId: string;
  created_at?: string;
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
  addElection: (title: string, description: string, startDate: string, endDate: string) => Promise<void>;
  updateElectionStatus: (id: string, status: "upcoming" | "active" | "completed") => Promise<void>;
  applyForElection: (userId: string, electionId: string, position: string) => Promise<boolean>;
  castVote: (electionId: string, candidateId: string, voterId: string) => Promise<boolean>;
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
  addElection: async () => {},
  updateElectionStatus: async () => {},
  applyForElection: async () => false,
  castVote: async () => false,
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
            // Map database user to our User type
            const mappedUser: User = {
              id: userData.id,
              email: userData.email,
              name: userData.name,
              role: userData.role as "admin" | "voter" | "candidate",
              user_id: userData.user_id
            };
            setCurrentUser(mappedUser);
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
              // Map database user to our User type
              const mappedUser: User = {
                id: userData.id,
                email: userData.email,
                name: userData.name,
                role: userData.role as "admin" | "voter" | "candidate",
                user_id: userData.user_id
              };
              setCurrentUser(mappedUser);
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
        if (electionsData) {
          // Map database elections to our Election type
          const mappedElections: Election[] = electionsData.map(election => ({
            id: election.id,
            title: election.title,
            description: election.description,
            status: election.status as "upcoming" | "active" | "completed",
            startDate: election.start_date,
            endDate: election.end_date,
            candidates: [],
            created_by: election.created_by,
            created_at: election.created_at,
            updated_at: election.updated_at
          }));
          setElections(mappedElections);
        }

        // Fetch candidates
        const { data: candidatesData } = await supabase
          .from('candidates')
          .select('*, users!candidates_user_id_fkey(name)');
        if (candidatesData) {
          // Map database candidates to our Candidate type
          const mappedCandidates: Candidate[] = candidatesData.map(candidate => ({
            id: candidate.id,
            userId: candidate.user_id,
            name: candidate.users?.name || null,
            electionId: candidate.election_id,
            position: candidate.position,
            votes: candidate.votes || 0,
            created_at: candidate.created_at,
            updated_at: candidate.updated_at
          }));
          setCandidates(mappedCandidates);
        }

        // Fetch votes if admin or relevant to user
        const { data: votesData } = await supabase
          .from('votes')
          .select('*');
        if (votesData) {
          // Map database votes to our Vote type
          const mappedVotes: Vote[] = votesData.map(vote => ({
            id: vote.id,
            electionId: vote.election_id,
            candidateId: vote.candidate_id,
            voterId: vote.voter_id,
            created_at: vote.created_at
          }));
          setVotes(mappedVotes);
        }

        // Fetch users if admin
        if (currentUser.role === 'admin') {
          const { data: usersData } = await supabase
            .from('users')
            .select('*');
          if (usersData) {
            // Map database users to our User type
            const mappedUsers: User[] = usersData.map(user => ({
              id: user.id,
              email: user.email,
              name: user.name,
              role: user.role as "admin" | "voter" | "candidate",
              user_id: user.user_id
            }));
            setUsers(mappedUsers);
          }
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

      // Map the newly created election to our Election type
      const newElection: Election = {
        id: data.id,
        title: data.title,
        description: data.description,
        status: data.status as "upcoming" | "active" | "completed",
        startDate: data.start_date,
        endDate: data.end_date,
        candidates: [],
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setElections(prev => [...prev, newElection]);
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

      // Map the newly created candidate to our Candidate type
      const newCandidate: Candidate = {
        id: data.id,
        userId: data.user_id,
        name: currentUser?.name || null,
        electionId: data.election_id,
        position: data.position,
        votes: 0,
        created_at: data.created_at,
        updated_at: data.updated_at
      };
      
      setCandidates(prev => [...prev, newCandidate]);
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

      // Map the newly created vote to our Vote type
      const newVote: Vote = {
        id: data.id,
        electionId: data.election_id,
        candidateId: data.candidate_id,
        voterId: data.voter_id,
        created_at: data.created_at
      };
      
      setVotes(prev => [...prev, newVote]);
      
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
    return votes.some((v) => v.electionId === electionId && v.voterId === voterId);
  };

  const getElectionResults = (electionId: string) => {
    return candidates
      .filter((c) => c.electionId === electionId)
      .sort((a, b) => b.votes - a.votes);
  };

  const contextValue: AppContextType = {
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
