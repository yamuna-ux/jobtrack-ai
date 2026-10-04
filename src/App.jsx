import { useEffect, useMemo, useState } from 'react'
import './App.css'

const STORAGE_KEY = 'jobtrack-applications'
const SETTINGS_KEY = 'jobtrack-settings'
const statuses = ['Applied', 'Interview', 'Offer', 'Rejected', 'Pending']
const navigation = [
  { label: 'Dashboard', icon: 'dashboard' },
  { label: 'Applications', icon: 'briefcase' },
  { label: 'Analytics', icon: 'chart' },
  { label: 'Settings', icon: 'settings' },
]

const sampleApplications = [
  { id: 'sample-1', company: 'Figma', role: 'Product Design Intern', location: 'Remote', date: '2026-09-28', url: 'https://figma.com/careers', notes: 'Reached out to campus recruiter after the design talk.', status: 'Interview' },
  { id: 'sample-2', company: 'Stripe', role: 'Frontend Engineer, New Grad', location: 'San Francisco, CA', date: '2026-09-25', url: 'https://stripe.com/jobs', notes: 'Tailored portfolio for the dashboard team.', status: 'Applied' },
  { id: 'sample-3', company: 'Notion', role: 'Associate Product Manager', location: 'New York, NY', date: '2026-09-22', url: 'https://notion.so/careers', notes: 'Application submitted through university portal.', status: 'Pending' },
  { id: 'sample-4', company: 'Linear', role: 'Software Engineer Intern', location: 'Remote', date: '2026-09-19', url: 'https://linear.app/careers', notes: 'Follow up with Alex next week.', status: 'Offer' },
  { id: 'sample-5', company: 'Vercel', role: 'Developer Experience Intern', location: 'Remote', date: '2026-09-16', url: 'https://vercel.com/careers', notes: '', status: 'Rejected' },
  { id: 'sample-6', company: 'Webflow', role: 'UX Research Intern', location: 'San Francisco, CA', date: '2026-09-12', url: 'https://webflow.com/careers', notes: 'Referred by Maya from the alumni network.', status: 'Applied' },
]

function readStorage(key, fallback) {
  try {
    const stored = localStorage.getItem(key)
    return stored ? JSON.parse(stored) : fallback
  } catch {
    return fallback
  }
}

function Icon({ name, size = 20 }) {
  const paths = {
    dashboard: <><rect x="3" y="3" width="8" height="8" rx="1.5" /><rect x="14" y="3" width="7" height="5" rx="1.5" /><rect x="14" y="11" width="7" height="10" rx="1.5" /><rect x="3" y="14" width="8" height="7" rx="1.5" /></>,
    briefcase: <><rect x="3" y="7" width="18" height="14" rx="2" /><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 12h18M10 12v2h4v-2" /></>,
    chart: <><path d="M3 3v18h18M8 15l4-4 4 3 5-7" /><path d="M17 7h4v4" /></>,
    settings: <><circle cx="12" cy="12" r="3" /><path d="m19.4 15 .1.1 1.4 1.1-1.4 2.4-1.7-.7a8 8 0 0 1-1.7 1l-.3 1.8h-2.8l-.3-1.8a8 8 0 0 1-1.7-1l-1.7.7-1.4-2.4 1.4-1.1a7 7 0 0 1 0-2L5.9 12l1.4-2.4 1.7.7a8 8 0 0 1 1.7-1l.3-1.8h2.8l.3 1.8a8 8 0 0 1 1.7 1l1.7-.7 1.4 2.4-1.4 1.1a7 7 0 0 1-.1 1.9Z" transform="translate(-1 -2)" /></>,
    search: <><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></>,
    plus: <path d="M12 5v14M5 12h14" />,
    filter: <><path d="M4 7h16M7 12h10m-7 5h4" /><circle cx="8" cy="7" r="1" /><circle cx="16" cy="12" r="1" /><circle cx="10" cy="17" r="1" /></>,
    arrow: <><path d="M7 17 17 7M7 7h10v10" /></>,
    dots: <><circle cx="5" cy="12" r="1" /><circle cx="12" cy="12" r="1" /><circle cx="19" cy="12" r="1" /></>,
    close: <path d="m18 6-12 12M6 6l12 12" />,
    trash: <><path d="M3 6h18M8 6V4h8v2m3 0-1 14H6L5 6m4 4v6m6-6v6" /></>,
    edit: <><path d="m15 5 4 4M4 20l4-.8L19 8a2.1 2.1 0 0 0-3-3L5 16l-1 4Z" /></>,
    external: <><path d="M14 3h7v7m-11 4L21 3" /><path d="M19 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h6" /></>,
    download: <><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4m4-5 5 5 5-5m-5 5V3" /></>,
    spark: <><path d="m12 3 1.9 5.8L20 11l-6.1 2.2L12 19l-2-5.8L4 11l6-2.2L12 3Z" /><path d="m19 14 1.2 2.8L23 18l-2.8 1.2L19 22l-1.2-2.8L15 18l2.8-1.2L19 14Z" /></>,
    clock: <><circle cx="12" cy="12" r="9" /><path d="M12 7v5l3 2" /></>,
    check: <path d="m5 12 4 4L19 6" />,
  }

  return <svg aria-hidden="true" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>
}

function StatusBadge({ status }) {
  return <span className={`status-badge status-${status.toLowerCase()}`}><span className="status-dot" />{status}</span>
}

function ApplicationModal({ application, onClose, onSave }) {
  const [form, setForm] = useState(application || {
    company: '', role: '', location: '', date: new Date().toISOString().slice(0, 10), url: '', notes: '', status: 'Applied',
  })

  function updateField(event) {
    setForm((current) => ({ ...current, [event.target.name]: event.target.value }))
  }

  function submit(event) {
    event.preventDefault()
    onSave({ ...form, id: application?.id || crypto.randomUUID() })
  }

  return (
    <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && onClose()}>
      <section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
        <div className="modal-heading"><div><p className="eyebrow">YOUR JOB SEARCH</p><h2 id="modal-title">{application ? 'Edit application' : 'Add application'}</h2></div><button className="icon-button" type="button" aria-label="Close dialog" onClick={onClose}><Icon name="close" /></button></div>
        <form onSubmit={submit} className="application-form">
          <label>Company name<input name="company" value={form.company} onChange={updateField} placeholder="e.g. Acme Inc." required autoFocus /></label>
          <label>Job role<input name="role" value={form.role} onChange={updateField} placeholder="e.g. Product Designer" required /></label>
          <div className="form-row"><label>Location<input name="location" value={form.location} onChange={updateField} placeholder="Remote or city" /></label><label>Application date<input name="date" type="date" value={form.date} onChange={updateField} required /></label></div>
          <label>Job URL<input name="url" type="url" value={form.url} onChange={updateField} placeholder="https://company.com/careers" /></label>
          <label>Status<select name="status" value={form.status} onChange={updateField}>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label>
          <label>Notes<textarea name="notes" value={form.notes} onChange={updateField} placeholder="Recruiter contact, interview details, or a reminder..." rows="3" /></label>
          <div className="modal-actions"><button type="button" className="button button-secondary" onClick={onClose}>Cancel</button><button type="submit" className="button button-primary">{application ? 'Save changes' : 'Add application'}</button></div>
        </form>
      </section>
    </div>
  )
}

function EmptyState({ onAdd }) {
  return <div className="empty-state"><span className="empty-icon"><Icon name="briefcase" size={25} /></span><h3>No applications found</h3><p>Try a different search, or add your next opportunity.</p><button type="button" className="button button-primary" onClick={onAdd}><Icon name="plus" size={17} /> Add application</button></div>
}

function ApplicationsTable({ applications, onEdit, onDelete }) {
  return (
    <div className="table-scroll"><table className="application-table"><thead><tr><th>Company / Role</th><th>Location</th><th>Date applied</th><th>Status</th><th><span className="sr-only">Actions</span></th></tr></thead><tbody>
      {applications.map((application) => <tr key={application.id}>
        <td><div className="company-cell"><span className={`company-mark mark-${application.company.toLowerCase().replace(/[^a-z]/g, '').slice(0, 8)}`}>{application.company.slice(0, 1).toUpperCase()}</span><div className="company-info"><strong>{application.company}</strong><span>{application.role}</span></div></div></td>
        <td className="muted-cell">{application.location || '—'}</td><td className="muted-cell">{formatDate(application.date)}</td><td><StatusBadge status={application.status} /></td>
        <td><div className="row-actions">{application.url && <a className="icon-button small-icon" href={application.url} target="_blank" rel="noreferrer" aria-label={`Open ${application.company} job posting`} title="Open job posting"><Icon name="external" size={16} /></a>}<button className="icon-button small-icon" type="button" onClick={() => onEdit(application)} aria-label={`Edit ${application.company} application`} title="Edit"><Icon name="edit" size={16} /></button><button className="icon-button small-icon danger-icon" type="button" onClick={() => onDelete(application)} aria-label={`Delete ${application.company} application`} title="Delete"><Icon name="trash" size={16} /></button></div></td>
      </tr>)}
    </tbody></table></div>
  )
}

function Dashboard({ applications, onAdd, onEdit, onDelete }) {
  const counts = useMemo(() => statuses.reduce((result, status) => ({ ...result, [status]: applications.filter((app) => app.status === status).length }), {}), [applications])
  const stats = [
    { label: 'Total applications', value: applications.length, icon: 'briefcase', tone: 'blue', detail: 'Across your job search' },
    { label: 'Interviews', value: counts.Interview, icon: 'spark', tone: 'violet', detail: 'You are moving forward' },
    { label: 'Offers', value: counts.Offer, icon: 'check', tone: 'green', detail: 'Time to celebrate' },
    { label: 'Rejected', value: counts.Rejected, icon: 'chart', tone: 'rose', detail: 'Keep showing up' },
    { label: 'Pending', value: counts.Pending + counts.Applied, icon: 'clock', tone: 'amber', detail: 'Waiting on a response' },
  ]
  const recent = [...applications].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)

  return <>
    <section className="welcome-banner"><div className="welcome-copy"><span className="welcome-kicker"><Icon name="spark" size={15} /> YOUR NEXT CHAPTER STARTS HERE</span><h2>Small steps. Big opportunities.</h2><p>Every application gets you closer to the right role. Keep your momentum going.</p><button type="button" className="button banner-button" onClick={onAdd}><Icon name="plus" size={17} /> Add an application</button></div><div className="banner-art" aria-hidden="true"><div className="orbit orbit-one" /><div className="orbit orbit-two" /><div className="banner-planet"><Icon name="briefcase" size={30} /></div><span className="orbit-star star-one" /><span className="orbit-star star-two" /><span className="orbit-star star-three" /></div></section>
    <section className="stats-grid" aria-label="Application statistics">{stats.map((stat) => <article className="stat-card" key={stat.label}><div className="stat-top"><span className={`stat-icon tone-${stat.tone}`}><Icon name={stat.icon} size={19} /></span><span className="stat-label">{stat.label}</span><Icon name="arrow" size={15} /></div><strong className="stat-number">{stat.value.toString().padStart(2, '0')}</strong><span className="stat-detail">{stat.detail}</span></article>)}</section>
    <section className="content-panel dashboard-list"><div className="panel-heading"><div><p className="eyebrow">YOUR PIPELINE</p><h2>Recent applications</h2></div><button className="text-button" type="button" onClick={() => document.dispatchEvent(new CustomEvent('jobtrack-navigate', { detail: 'Applications' }))}>View all <span aria-hidden="true">→</span></button></div>{recent.length ? <ApplicationsTable applications={recent} onEdit={onEdit} onDelete={onDelete} /> : <EmptyState onAdd={onAdd} />}</section>
    <section className="bottom-insight"><span className="insight-icon"><Icon name="spark" size={20} /></span><p><strong>Consistency is your superpower.</strong> A little progress every day adds up to something remarkable.</p><span className="insight-decoration" aria-hidden="true" /></section>
  </>
}

function ApplicationsPage({ applications, onAdd, onEdit, onDelete, search, setSearch, filter, setFilter, visibleApplications }) {
  return <section className="content-panel full-applications"><div className="panel-heading applications-heading"><div><p className="eyebrow">YOUR JOB SEARCH</p><h2>All applications <span className="count-chip">{applications.length}</span></h2><p className="panel-subtitle">Keep every opportunity organized in one place.</p></div><button type="button" className="button button-primary" onClick={onAdd}><Icon name="plus" size={17} /> Add application</button></div>
    <div className="table-tools"><div className="search-box"><Icon name="search" size={18} /><input aria-label="Search applications" placeholder="Search company or role..." value={search} onChange={(event) => setSearch(event.target.value)} /><kbd>Ctrl K</kbd></div><label className="filter-box"><Icon name="filter" size={17} /><span className="sr-only">Filter by status</span><select value={filter} onChange={(event) => setFilter(event.target.value)}><option value="All">All statuses</option>{statuses.map((status) => <option key={status}>{status}</option>)}</select></label></div>
    {visibleApplications.length ? <ApplicationsTable applications={visibleApplications} onEdit={onEdit} onDelete={onDelete} /> : <EmptyState onAdd={onAdd} />}
    <div className="table-footer">Showing <strong>{visibleApplications.length}</strong> of <strong>{applications.length}</strong> applications<span>Last updated just now</span></div>
  </section>
}

function AnalyticsPage({ applications }) {
  const total = applications.length
  const order = ['Applied', 'Interview', 'Offer', 'Rejected', 'Pending']
  const colors = { Applied: '#7197f5', Interview: '#aa86ed', Offer: '#48b99b', Rejected: '#ed8291', Pending: '#e8b14d' }
  const counts = order.map((status) => applications.filter((application) => application.status === status).length)
  const segments = total ? order.reduce((result, status, index) => { const start = result.end; const end = start + (counts[index] / total) * 100; result.css.push(`${colors[status]} ${start}% ${end}%`); result.end = end; return result }, { end: 0, css: [] }).css.join(', ') : '#edf0f6 0% 100%'
  const responseRate = total ? Math.round((applications.filter((app) => ['Interview', 'Offer', 'Rejected'].includes(app.status)).length / total) * 100) : 0
  const currentDate = new Date()
  const monthDates = Array.from({ length: 6 }, (_, index) => new Date(currentDate.getFullYear(), currentDate.getMonth() - 5 + index, 1))
  const monthLabels = monthDates.map((date) => date.toLocaleDateString('en-US', { month: 'short' }))
  const monthly = monthDates.map((monthDate) => applications.filter((app) => {
    const appliedDate = new Date(`${app.date}T12:00:00`)
    return appliedDate.getMonth() === monthDate.getMonth() && appliedDate.getFullYear() === monthDate.getFullYear()
  }).length)
  const maxMonth = Math.max(...monthly, 1)

  return <div className="analytics-layout"><section className="content-panel breakdown-panel"><div className="panel-heading"><div><p className="eyebrow">AT A GLANCE</p><h2>Status breakdown</h2></div><span className="period-label">All time</span></div><div className="donut-layout"><div className="donut-chart" style={{ '--chart-segments': segments }}><div className="donut-center"><strong>{total}</strong><span>applications</span></div></div><div className="legend-list">{order.map((status, index) => <div className="legend-row" key={status}><span className="legend-color" style={{ backgroundColor: colors[status] }} /><span>{status}</span><strong>{counts[index]}</strong><small>{total ? Math.round((counts[index] / total) * 100) : 0}%</small></div>)}</div></div></section>
    <section className="content-panel response-panel"><div><p className="eyebrow">MOMENTUM CHECK</p><h2>Response rate</h2></div><div className="response-number">{responseRate}<span>%</span></div><p className="response-copy">of your applications have received a response. Every follow-up counts.</p><div className="response-progress"><span style={{ width: `${responseRate}%` }} /></div><span className="response-caption">{applications.filter((app) => ['Interview', 'Offer', 'Rejected'].includes(app.status)).length} responses from {total} applications</span></section>
    <section className="content-panel activity-panel"><div className="panel-heading"><div><p className="eyebrow">BUILDING MOMENTUM</p><h2>Applications over time</h2></div><span className="period-label">Last 6 months</span></div><div className="bar-chart">{monthly.map((count, index) => <div className="bar-column" key={`${monthLabels[index]}-${monthDates[index].getFullYear()}`}><span className="bar-value">{count || ''}</span><div className="bar-track"><span style={{ height: `${Math.max((count / maxMonth) * 100, count ? 9 : 3)}%` }} /></div><span className="bar-month">{monthLabels[index]}</span></div>)}</div><p className="chart-footnote">Applications by month based on the date you applied.</p></section>
  </div>
}

function SettingsPage({ settings, onSettingsChange, onExport, onClear }) {
  return <div className="settings-layout"><section className="content-panel settings-panel"><div className="panel-heading"><div><p className="eyebrow">MAKE IT YOURS</p><h2>Profile & preferences</h2><p className="panel-subtitle">A few details to keep your job search feeling personal.</p></div></div><form className="settings-form" onSubmit={(event) => event.preventDefault()}><label>Your name<input value={settings.name} onChange={(event) => onSettingsChange({ ...settings, name: event.target.value })} placeholder="Your name" /></label><label>Weekly application goal<input type="number" min="1" max="100" value={settings.goal} onChange={(event) => onSettingsChange({ ...settings, goal: event.target.value })} /></label><div className="settings-note"><span className="insight-icon"><Icon name="spark" size={19} /></span><p>Your data is stored privately in this browser. No account or backend required.</p></div><div className="settings-actions"><button className="button button-secondary" type="button" onClick={onExport}><Icon name="download" size={17} /> Export applications</button><button className="button button-danger" type="button" onClick={onClear}><Icon name="trash" size={17} /> Clear all data</button></div></form></section></div>
}

function formatDate(date) {
  if (!date) return '—'
  return new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function App() {
  const [applications, setApplications] = useState(() => readStorage(STORAGE_KEY, sampleApplications))
  const [settings, setSettings] = useState(() => readStorage(SETTINGS_KEY, { name: '', goal: 5 }))
  const [activePage, setActivePage] = useState('Dashboard')
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('All')
  const [editingApplication, setEditingApplication] = useState(null)
  const [modalOpen, setModalOpen] = useState(false)
  const [deleteTarget, setDeleteTarget] = useState(null)
  const [toast, setToast] = useState('')

  useEffect(() => localStorage.setItem(STORAGE_KEY, JSON.stringify(applications)), [applications])
  useEffect(() => localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings)), [settings])
  useEffect(() => {
    function onNavigate(event) { setActivePage(event.detail) }
    document.addEventListener('jobtrack-navigate', onNavigate)
    return () => document.removeEventListener('jobtrack-navigate', onNavigate)
  }, [])
  useEffect(() => {
    if (!toast) return undefined
    const timeout = window.setTimeout(() => setToast(''), 2600)
    return () => window.clearTimeout(timeout)
  }, [toast])
  useEffect(() => {
    function onShortcut(event) {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        setActivePage('Applications')
        window.setTimeout(() => document.querySelector('.search-box input')?.focus(), 0)
      }
      if (event.key === 'Escape') { setModalOpen(false); setDeleteTarget(null) }
    }
    window.addEventListener('keydown', onShortcut)
    return () => window.removeEventListener('keydown', onShortcut)
  }, [])

  const visibleApplications = useMemo(() => applications.filter((application) => {
    const matchesSearch = `${application.company} ${application.role} ${application.location}`.toLowerCase().includes(search.toLowerCase())
    return matchesSearch && (filter === 'All' || application.status === filter)
  }).sort((a, b) => b.date.localeCompare(a.date)), [applications, search, filter])

  function openAddModal() { setEditingApplication(null); setModalOpen(true) }
  function saveApplication(application) {
    setApplications((current) => editingApplication ? current.map((item) => item.id === application.id ? application : item) : [application, ...current])
    setModalOpen(false)
    setToast(editingApplication ? 'Application updated' : 'Application added')
  }
  function deleteApplication() {
    setApplications((current) => current.filter((application) => application.id !== deleteTarget.id))
    setDeleteTarget(null)
    setToast('Application deleted')
  }
  function exportApplications() {
    const blob = new Blob([JSON.stringify(applications, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'jobtrack-applications.json'
    link.click()
    URL.revokeObjectURL(url)
    setToast('Your applications have been exported')
  }
  function clearApplications() {
    if (window.confirm('Delete all saved applications? This cannot be undone.')) {
      setApplications([])
      setToast('All applications cleared')
    }
  }
  function beginEdit(application) { setEditingApplication(application); setModalOpen(true) }

  const today = new Date()
  const formattedToday = today.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
  const pageTitles = { Dashboard: 'Dashboard', Applications: 'Applications', Analytics: 'Analytics', Settings: 'Settings' }

  return <div className="app-shell">
    <aside className="sidebar"><a className="brand" href="#dashboard" onClick={(event) => { event.preventDefault(); setActivePage('Dashboard') }}><span className="brand-mark"><Icon name="briefcase" size={21} /></span><span>jobtrack<span className="brand-ai">.ai</span></span></a><div className="sidebar-section-label">WORKSPACE</div><nav className="side-nav" aria-label="Main navigation">{navigation.map((item) => <button type="button" key={item.label} className={`nav-item ${activePage === item.label ? 'active' : ''}`} onClick={() => setActivePage(item.label)}><Icon name={item.icon} size={19} /><span>{item.label}</span>{item.label === 'Applications' && <span className="nav-count">{applications.length}</span>}</button>)}</nav><div className="sidebar-spacer" /><div className="sidebar-tip"><span className="tip-spark"><Icon name="spark" size={17} /></span><strong>Little wins add up.</strong><p>Keep showing up for the future you want.</p><div className="tip-progress"><span style={{ width: `${Math.min((applications.length / Math.max(Number(settings.goal) || 5, 1)) * 100, 100)}%` }} /></div><small>{applications.length} of {settings.goal || 5} weekly goal</small></div><button type="button" className="profile-button" onClick={() => setActivePage('Settings')}><span className="avatar">{settings.name ? settings.name.trim().slice(0, 1).toUpperCase() : 'J'}</span><span className="profile-copy"><strong>{settings.name || 'Job seeker'}</strong><small>Early career explorer</small></span><Icon name="dots" size={18} /></button></aside>
    <main className="main-area"><header className="topbar"><div className="topbar-title"><span className="breadcrumb">Workspace <span>/</span></span><span className="current-page">{pageTitles[activePage]}</span></div><div className="topbar-right"><span className="date-label"><Icon name="clock" size={15} /> {formattedToday}</span><span className="topbar-divider" /><button type="button" className="header-avatar" onClick={() => setActivePage('Settings')} aria-label="Open settings">{settings.name ? settings.name.trim().slice(0, 1).toUpperCase() : 'J'}</button><span className="header-user">{settings.name || 'Jordan Lee'}</span></div></header><div className="mobile-nav">{navigation.map((item) => <button type="button" key={item.label} className={activePage === item.label ? 'mobile-nav-active' : ''} onClick={() => setActivePage(item.label)} aria-label={item.label}><Icon name={item.icon} size={19} /><span>{item.label}</span></button>)}</div><div className="page-content">
      <div className="page-heading"><div><p className="eyebrow">{activePage === 'Dashboard' ? 'YOUR JOB SEARCH, AT A GLANCE' : 'JOB SEARCH WORKSPACE'}</p><h1>{activePage === 'Dashboard' ? `Good ${today.getHours() < 12 ? 'morning' : today.getHours() < 17 ? 'afternoon' : 'evening'}${settings.name ? `, ${settings.name.split(' ')[0]}` : ''}` : pageTitles[activePage]}<span className="heading-period">{activePage === 'Dashboard' ? '.' : ''}</span></h1><p className="page-subtitle">{activePage === 'Dashboard' ? 'Here’s what’s happening with your job search.' : activePage === 'Applications' ? 'Every opportunity, thoughtfully organized.' : activePage === 'Analytics' ? 'A clearer picture of all the work you’re putting in.' : 'Tune your workspace to fit your journey.'}</p></div>{activePage === 'Dashboard' && <button type="button" className="button button-primary heading-add" onClick={openAddModal}><Icon name="plus" size={17} /> Add application</button>}</div>
      {activePage === 'Dashboard' && <Dashboard applications={applications} onAdd={openAddModal} onEdit={beginEdit} onDelete={setDeleteTarget} />}
      {activePage === 'Applications' && <ApplicationsPage applications={applications} onAdd={openAddModal} onEdit={beginEdit} onDelete={setDeleteTarget} search={search} setSearch={setSearch} filter={filter} setFilter={setFilter} visibleApplications={visibleApplications} />}
      {activePage === 'Analytics' && <AnalyticsPage applications={applications} />}
      {activePage === 'Settings' && <SettingsPage settings={settings} onSettingsChange={setSettings} onExport={exportApplications} onClear={clearApplications} />}
      <footer className="page-footer"><span>© 2026 Job Track AI</span><span>One application at a time.</span></footer>
    </div></main>
    {modalOpen && <ApplicationModal application={editingApplication} onClose={() => setModalOpen(false)} onSave={saveApplication} />}
    {deleteTarget && <div className="modal-backdrop" role="presentation" onMouseDown={(event) => event.target === event.currentTarget && setDeleteTarget(null)}><section className="modal confirm-modal" role="alertdialog" aria-modal="true" aria-labelledby="delete-title"><span className="delete-icon"><Icon name="trash" size={22} /></span><h2 id="delete-title">Delete this application?</h2><p>{deleteTarget.company} · {deleteTarget.role} will be removed from your tracker.</p><div className="modal-actions"><button type="button" className="button button-secondary" onClick={() => setDeleteTarget(null)}>Keep it</button><button type="button" className="button button-danger" onClick={deleteApplication}>Delete application</button></div></section></div>}
    {toast && <div className="toast-message" role="status"><span><Icon name="check" size={16} /></span>{toast}</div>}
  </div>
}

export default App
