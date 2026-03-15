import { useState } from 'react'
import { Modal } from './UI'
import { api } from '@/hooks'

export default function EditProfileModal({ user, onClose, onUpdate, toast }) {
  const [name,    setName]    = useState(user?.name || "")
  const [curP,    setCurP]    = useState('')
  const [newP,    setNewP]    = useState('')
  const [loading, setLoading] = useState(false)
  const [error,   setError]   = useState('')

  const save = async () => {
    setError('')
    if (!name.trim()) { setError('Name is required'); return }
    setLoading(true)
    try {
      const payload = { name: name.trim() }
      if (newP) { payload.currentPassword = curP; payload.newPassword = newP }
      const updated = await api.put('/api/auth/me', payload)
      onUpdate(updated)
      toast('Profile updated!')
      onClose()
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }

  const lbl = { fontSize:'11.5px', color:'var(--text2)', marginBottom:'6px', display:'block', fontWeight:'600', letterSpacing:'.7px', textTransform:'uppercase' }

  return (
    <Modal title="Edit Profile" onClose={onClose}
      footer={
        <div style={{ display:'flex', gap:'10px' }}>
          <button className="btn btn-ghost" style={{ flex:1, justifyContent:'center' }} onClick={onClose}>Cancel</button>
          <button className="btn btn-primary" style={{ flex:2, justifyContent:'center' }} onClick={save} disabled={loading}>
            {loading ? 'Saving…' : 'Save Changes'}
          </button>
        </div>
      }>
      {error && <div style={{ background:'rgba(239,68,68,.1)', border:'1px solid rgba(239,68,68,.2)', borderRadius:'10px', padding:'12px 14px', fontSize:'14px', color:'var(--red)', marginBottom:'14px' }}>{error}</div>}

      <div style={{ marginBottom:'14px' }}>
        <label style={lbl}>Name</label>
        <input className="input" value={name} onChange={e => setName(e.target.value)} />
      </div>
      <div style={{ marginBottom:'14px' }}>
        <label style={lbl}>Email</label>
        <input className="input" value={user?.email || ""} disabled style={{ opacity:.5 }} />
      </div>

      <div style={{ height:'1px', background:'var(--border)', margin:'16px 0' }} />
      <div style={{ fontFamily:'Bebas Neue,sans-serif', fontSize:'16px', letterSpacing:'1px', marginBottom:'14px', color:'var(--text2)' }}>CHANGE PASSWORD</div>

      <div style={{ marginBottom:'14px' }}>
        <label style={lbl}>Current Password</label>
        <input className="input" type="password" placeholder="Leave blank to keep current"
          value={curP} onChange={e => setCurP(e.target.value)} />
      </div>
      <div style={{ marginBottom:'18px' }}>
        <label style={lbl}>New Password</label>
        <input className="input" type="password" placeholder="Min. 6 characters"
          value={newP} onChange={e => setNewP(e.target.value)} />
      </div>
    </Modal>
  )
}
