import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth0 } from '@auth0/auth0-react'
import { toast } from 'react-toastify'
import supabase from '../utils/supabaseClient'
import axios from 'axios'

export default function PostJobForm({ embed }) {
  const navigate = useNavigate()
  const { user, getAccessTokenSilently } = useAuth0()
  const [isLoading, setIsLoading] = useState(false)

  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [skills, setSkills] = useState('')
  const [budget, setBudget] = useState('')
  const [duration, setDuration] = useState('')

  const [milestones, setMilestones] = useState([
    { title: '', description: '', dueDate: '', amount: '' }
  ])

  const handleAddMilestone = () => {
    setMilestones([...milestones, { title: '', description: '', dueDate: '', amount: '' }])
  }

  const handleRemoveMilestone = (idx) => {
    if (milestones.length === 1) return
    setMilestones(milestones.filter((_, i) => i !== idx))
  }

  const handleMilestoneChange = (idx, field, val) => {
    const copy = [...milestones]
    copy[idx][field] = val
    setMilestones(copy)
  }

  const validate = () => {
    if (!title.trim()) return 'Job title is required'
    if (!description.trim()) return 'Job description is required'
    if (!budget) return 'Budget is required'
    if (!duration) return 'Duration is required'
    for (let m of milestones) {
      if (!m.title.trim()) return 'All milestone titles are required'
      if (!m.dueDate) return 'All milestone due dates are required'
      if (!m.amount) return 'All milestone amounts are required'
    }
    return null
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const errMsg = validate()
    if (errMsg) { toast.error(errMsg); return }
    setIsLoading(true)

    try {
      const skillsArr = skills.split(',').map(s => s.trim()).filter(Boolean)
      const { data: project, error: projErr } = await supabase
        .from('projects')
        .insert({
          user_id: user.sub,
          title,
          description,
          skills: skillsArr,
          budget: parseFloat(budget),
          duration,
          status: 'open'
        })
        .select('id')
        .single()
      if (projErr) throw projErr

      const toInsert = milestones.map(m => ({
        project_id: project.id,
        title: m.title,
        description: m.description,
        due_date: m.dueDate,
        amount: parseFloat(m.amount)
      }))
      const { error: msErr } = await supabase.from('milestones').insert(toInsert)
      if (msErr) throw msErr

      toast.success('Job posted with milestones!')
      if (!embed) navigate('/client')
      else {
        setTitle('')
        setDescription('')
        setSkills('')
        setBudget('')
        setDuration('')
        setMilestones([{ title: '', description: '', dueDate: '', amount: '' }])
      }

    } catch (err) {
      console.error('Error posting job:', err)
      toast.error('Failed to post job')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="w-full max-w-4xl mx-auto">
      <form onSubmit={handleSubmit} className="space-y-6">
        <h1 className="text-2xl font-bold text-white mb-6">Post a New Job</h1>
        <div className="border border-gray-700 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-white mb-3">Milestones</h3>
          {milestones.map((m, i) => (
            <div key={i} className="mb-4 p-4 border border-gray-700 rounded bg-[#1a1a1a]">
              <div className="flex justify-between">
                <h4 className="text-white font-medium">Milestone {i+1}</h4>
                <button
                  type="button"
                  onClick={() => handleRemoveMilestone(i)}
                  disabled={milestones.length===1}
                  className="text-red-500"
                >
                  Remove
                </button>
              </div>
              <input
                placeholder="Title"
                value={m.title}
                onChange={e => handleMilestoneChange(i, 'title', e.target.value)}
              />
              <input
                type="date"
                value={m.dueDate}
                onChange={e => handleMilestoneChange(i, 'dueDate', e.target.value)}
              />
              <input
                type="number"
                placeholder="Amount ($)"
                value={m.amount}
                onChange={e => handleMilestoneChange(i, 'amount', e.target.value)}
              />
              <textarea
                placeholder="Description"
                value={m.description}
                onChange={e => handleMilestoneChange(i, 'description', e.target.value)}
              />
            </div>
          ))}
          <button type="button" onClick={handleAddMilestone}>
            + Add Milestone
          </button>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2 bg-[#1abc9c] rounded-md text-white"
        >
          {isLoading ? 'Posting…' : 'Post Job'}
        </button>
      </form>
    </div>
  )
}