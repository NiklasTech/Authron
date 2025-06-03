import axios from "axios";

const API_URL = "http://localhost:8000/api/v1";

export interface Team {
  id?: number;
  name: string;
  description?: string;
  created_at?: string;
  member_count?: number;
}

export interface TeamMember {
  id?: number;
  user_id: number;
  username?: string;
  email?: string;
  role: string;
}

export const getAllTeams = async (): Promise<Team[]> => {
  try {
    const response = await axios.get(`${API_URL}/teams`);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Abrufen der Teams:", error);
    throw error;
  }
};

export const getTeam = async (teamId: number): Promise<Team> => {
  try {
    const response = await axios.get(`${API_URL}/teams/${teamId}`);
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Abrufen des Teams mit ID ${teamId}:`, error);
    throw error;
  }
};

export const createTeam = async (teamData: Team): Promise<Team> => {
  try {
    const response = await axios.post(`${API_URL}/teams`, teamData);
    return response.data;
  } catch (error) {
    console.error("Fehler beim Erstellen des Teams:", error);
    throw error;
  }
};

export const updateTeam = async (
  teamId: number,
  teamData: Partial<Team>
): Promise<Team> => {
  try {
    const response = await axios.put(`${API_URL}/teams/${teamId}`, teamData);
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Aktualisieren des Teams mit ID ${teamId}:`,
      error
    );
    throw error;
  }
};

export const deleteTeam = async (teamId: number): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/teams/${teamId}`);
  } catch (error) {
    console.error(`Fehler beim Löschen des Teams mit ID ${teamId}:`, error);
    throw error;
  }
};

export const getTeamMembers = async (teamId: number): Promise<TeamMember[]> => {
  try {
    const response = await axios.get(`${API_URL}/teams/${teamId}/members`);
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Abrufen der Mitglieder für Team ${teamId}:`,
      error
    );
    throw error;
  }
};

export const addTeamMember = async (
  teamId: number,
  memberData: Partial<TeamMember>
): Promise<TeamMember> => {
  try {
    const response = await axios.post(
      `${API_URL}/teams/${teamId}/members`,
      memberData
    );
    return response.data;
  } catch (error) {
    console.error(
      `Fehler beim Hinzufügen eines Mitglieds zu Team ${teamId}:`,
      error
    );
    throw error;
  }
};

export const updateTeamMember = async (
  teamId: number,
  memberId: number,
  memberData: Partial<TeamMember>
): Promise<TeamMember> => {
  try {
    const response = await axios.put(
      `${API_URL}/teams/${teamId}/members/${memberId}`,
      memberData
    );
    return response.data;
  } catch (error) {
    console.error(`Fehler beim Aktualisieren des Teammitglieds:`, error);
    throw error;
  }
};

export const removeTeamMember = async (
  teamId: number,
  memberId: number
): Promise<void> => {
  try {
    await axios.delete(`${API_URL}/teams/${teamId}/members/${memberId}`);
  } catch (error) {
    console.error(`Fehler beim Entfernen des Teammitglieds:`, error);
    throw error;
  }
};
