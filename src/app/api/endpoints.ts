'use client'

import { Lobby, Player, PlayerState } from "@/types/types"
import { useState } from "react"

interface APIReturn {
  isLoading: boolean
  getLobby: (join_code: string) => Promise<Lobby>
  joinLobby: (join_code: string, player_name: string) => Promise<Player>
  updateLobby: (join_code: string, lobby: Lobby) => Promise<Lobby>
  setReadyState: (join_code: string, player_id: string, is_ready: boolean) => Promise<Lobby>
  updateState: (join_code: string, player_id: string, player_state: PlayerState) => Promise<Lobby>
  startGame: (join_code: string) => Promise<Lobby>
  finishGame: (join_code: string) => Promise<Lobby>
}

const API_BASE_URL = 'https://bingo-pct-e87428930afe.herokuapp.com'

export const useAPI = (): APIReturn => {
  const [isLoading, setIsLoading] = useState(false)

  const getLobby = async (join_code: string): Promise<Lobby> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${join_code}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error('Failed to fetch lobby')
      }
      const data = await res.json()
      const fetchedLobby = data[0] ?? {}
      return fetchedLobby
    } catch (err) {
      console.error('Error fetching lobby:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const joinLobby = async (join_code: string, player_name: string): Promise<Player> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${join_code}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player_name, player_id: crypto.randomUUID() })
      })

      if (!res.ok) {
        throw new Error('Failed to join lobby')
      }
      const data = await res.json()
      const joinedPlayer = data ?? {}
      return joinedPlayer
    } catch (err) {
      console.error('Error joining lobby:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateLobby = async (join_code: string, lobby: Lobby): Promise<Lobby> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${join_code}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(lobby)
      })

      if (!res.ok) {
        throw new Error('Failed to update lobby')
      }
      const data = await res.json()
      const updatedLobby = data ?? {}
      return updatedLobby
    } catch (err) {
      console.error('Error updating lobby:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const setReadyState = async (join_code: string, player_id: string, is_ready: boolean): Promise<Lobby> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${join_code}/player/${player_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ is_ready })
      })

      if (!res.ok) {
        throw new Error('Failed to ready up')
      }
      const data = await res.json()
      const updatedLobby = data ?? {}
      return updatedLobby
    } catch (err) {
      console.error('Error readying up:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const updateState = async (join_code: string, player_id: string, player_state: PlayerState): Promise<Lobby> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${join_code}/player/${player_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ player_state })
      })

      if (!res.ok) {
        throw new Error('Failed to ready up')
      }
      const data = await res.json()
      const updatedLobby = data ?? {}
      return updatedLobby
    } catch (err) {
      console.error('Error readying up:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const startGame = async (join_code: string): Promise<Lobby> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${join_code}/start`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error('Failed to begin game')
      }
      const data = await res.json()
      const updatedLobby = data ?? {}
      return updatedLobby
    } catch (err) {
      console.error('Error beginning game:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  const finishGame = async (join_code: string): Promise<Lobby> => {
    setIsLoading(true)
    try {
      const res = await fetch(`${API_BASE_URL}/lobby/${join_code}/finish`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        }
      })

      if (!res.ok) {
        throw new Error('Failed to finish game')
      }
      const data = await res.json()
      const updatedLobby = data ?? {}
      return updatedLobby
    } catch (err) {
      console.error('Error beginning game:', err)
      throw err
    } finally {
      setIsLoading(false)
    }
  }

  return {
    isLoading,
    getLobby,
    joinLobby,
    updateLobby,
    setReadyState,
    updateState,
    startGame,
    finishGame
  }
}
