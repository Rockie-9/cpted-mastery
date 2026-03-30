'use client'

import { useState, useEffect, useCallback } from 'react'
import { PHASES, ALL_CU } from '@/data'
import { loadProgress, saveProgress } from '@/lib/storage'

/* ─── Shared Style Helpers ─── */
const S = { xs: 4, sm: 8, md: 16, lg: 24, xl: 40 }

function Icon({ d, size = 20, color = 'var(--text-2)' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
      stroke={color} strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
      <path d={d} />
    </svg>
  )
}

function ProgressBar({ pct, color = 'var(--accent)', height = 6 }) {
  return (
    <div style={{ background: 'var(--surface-2)', borderRadius: height / 2, height, width: '100%', overflow: 'hidden' }}>
      <div style={{ background: color, height: '100%', width: `${pct}%`, borderRadius: height / 2, transition: 'width 300ms ease' }} />
    </div>
  )
}

function CheckItem({ checked, onToggle, children }) {
  return (
    <div onClick={onToggle} style={{
      display: 'flex', alignItems: 'flex-start', gap: S.sm,
      cursor: 'pointer', padding: `${S.sm}px 0`, opacity: checked ? 0.6 : 1
    }}>
      <div style={{
        width: 20, height: 20, minWidth: 20, borderRadius: 4, marginTop: 2,
        border: checked ? 'none' : '1.5px solid var(--text-3)',
        background: checked ? 'var(--accent)' : 'transparent',
        display: 'flex', alignItems: 'center', justifyContent: 'center'
      }}>
        {checked && (
          <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
            <path d="M20 6L9 17l-5-5" />
          </svg>
        )}
      </div>
      <span style={{ fontSize: 16, lineHeight: 1.7, textDecoration: checked ? 'line-through' : 'none', color: checked ? 'var(--text-3)' : 'var(--text-1)' }}>
        {children}
      </span>
    </div>
  )
}

function TypeBadge({ type }) {
  const colors = { book: 'var(--accent)', standard: 'var(--accent-2)', paper: 'var(--accent-3)', guide: 'var(--accent-4)', template: '#EC4899', course: '#F97316', action: '#EF4444', journal: 'var(--accent-3)' }
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      background: `${colors[type] || 'var(--text-3)'}22`, color: colors[type] || 'var(--text-3)',
      textTransform: 'uppercase', letterSpacing: '0.05em', fontFamily: 'var(--mono)'
    }}>{type}</span>
  )
}

function CUTag({ cu }) {
  return (
    <span style={{
      fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
      background: 'var(--accent)22', color: 'var(--accent)',
      fontFamily: 'var(--mono)', letterSpacing: '0.03em'
    }}>{cu}</span>
  )
}

/* ─── Content Block ─── */
function ContentBlock({ item, t }) {
  const text = t(item.en, item.zh)
  const lines = text.split('\n').filter(Boolean)
  const titleColor = {
    concept: 'var(--accent)', framework: 'var(--accent-2)',
    insight: 'var(--accent-3)', check: 'var(--accent-4)', text: null
  }
  const bgColor = {
    concept: 'var(--accent)', framework: 'var(--accent-2)',
    insight: 'var(--accent-3)', check: 'var(--accent-4)', text: null
  }
  const hasTitle = item.title_en || item.title_zh

  return (
    <div style={{
      marginBottom: S.md, padding: S.md, borderRadius: 10,
      background: item.type === 'text' ? 'transparent' : `${bgColor[item.type] || 'var(--text-3)'}08`,
      borderLeft: item.type === 'text' ? 'none' : `3px solid ${titleColor[item.type] || 'var(--text-3)'}`,
    }}>
      {hasTitle && (
        <div style={{
          fontSize: 15, fontWeight: 700, marginBottom: S.sm,
          color: titleColor[item.type] || 'var(--text-1)',
          display: 'flex', alignItems: 'center', gap: S.sm
        }}>
          <span style={{
            fontSize: 11, fontWeight: 700, padding: '2px 6px', borderRadius: 4,
            background: `${titleColor[item.type]}22`, color: titleColor[item.type],
            fontFamily: 'var(--mono)', textTransform: 'uppercase'
          }}>{item.type}</span>
          {t(item.title_en, item.title_zh)}
        </div>
      )}
      <div style={{ fontSize: 16, lineHeight: 1.9, color: 'var(--text-2)' }}>
        {lines.map((line, i) => (
          <p key={i} style={{ marginBottom: i < lines.length - 1 ? S.sm : 0 }}>{line}</p>
        ))}
      </div>
    </div>
  )
}

/* ─── Module Card ─── */
function ModuleCard({ mod, phase, expandedModule, setExpandedModule, activeSection, setActiveSection, progress, toggle, getModPct, t, allModules }) {
  const isExp = expandedModule === mod.id
  const pct = getModPct(mod)
  const modIdx = allModules.findIndex(m => m.id === mod.id)
  const isLocked = modIdx > 0 && !progress[allModules[modIdx - 1].id + '-quiz-pass']

  const sections = [
    { id: 'content', en: 'Learn', zh: '學習' },
    { id: 'readings', en: 'Readings', zh: '閱讀' },
    { id: 'actions', en: 'Actions', zh: '行動' },
  ]

  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12,
      overflow: 'hidden', borderLeft: `3px solid var(${phase.color})`, opacity: isLocked ? 0.5 : 1
    }}>
      {/* Header */}
      <div onClick={() => { if (!isLocked) { setExpandedModule(isExp ? null : mod.id); setActiveSection('content'); } }}
        style={{ padding: S.md, cursor: isLocked ? 'default' : 'pointer', display: 'flex', flexDirection: 'column', gap: S.sm }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-1)', flex: 1 }}>
            {t(mod.en, mod.zh)}
          </span>
          <div style={{ display: 'flex', alignItems: 'center', gap: S.sm }}>
            <span style={{ fontSize: 14, fontWeight: 600, color: `var(${phase.color})`, fontFamily: 'var(--mono)' }}>
              {isLocked ? '🔒' : `${pct}%`}
            </span>
            <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="var(--text-3)" strokeWidth={2} strokeLinecap="round"
              style={{ transform: isExp ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 200ms ease' }}>
              <path d="M6 9l6 6 6-6" />
            </svg>
          </div>
        </div>
        <ProgressBar pct={pct} color={`var(${phase.color})`} height={4} />
        <div style={{ display: 'flex', gap: S.xs, flexWrap: 'wrap' }}>
          {mod.iccp && mod.iccp.map(cu => <CUTag key={cu} cu={cu} />)}
        </div>
      </div>

      {/* Expanded Content */}
      {isExp && (
        <div style={{ borderTop: '1px solid var(--border)' }}>
          {/* Section Tabs */}
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)' }}>
            {sections.map(s => (
              <button key={s.id} onClick={() => setActiveSection(s.id)} style={{
                flex: 1, padding: `${S.sm}px`, fontSize: 14, fontWeight: activeSection === s.id ? 600 : 400,
                color: activeSection === s.id ? 'var(--accent)' : 'var(--text-3)',
                background: activeSection === s.id ? 'var(--accent)08' : 'transparent',
                border: 'none', borderBottom: activeSection === s.id ? '2px solid var(--accent)' : '2px solid transparent',
                cursor: 'pointer', fontFamily: 'var(--font)'
              }}>{t(s.en, s.zh)}</button>
            ))}
          </div>

          <div style={{ padding: S.md, maxHeight: 700, overflowY: 'auto' }}>
            {/* Learn Tab */}
            {activeSection === 'content' && mod.content && mod.content.map((item, i) => (
              <ContentBlock key={i} item={item} t={t} />
            ))}

            {/* Readings Tab */}
            {activeSection === 'readings' && (
              <div>
                {mod.readings && mod.readings.map((r, i) => (
                  <CheckItem key={i} checked={!!progress[`${mod.id}-r${i}`]} onToggle={() => toggle(`${mod.id}-r${i}`)}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: S.xs, flexWrap: 'wrap' }}>
                      <TypeBadge type={r.type} />
                      {r.url ? (
                        <a href={r.url} target="_blank" rel="noopener noreferrer"
                          style={{ color: 'var(--accent)', borderBottom: '1px dotted var(--accent)' }}
                          onClick={e => e.stopPropagation()}>
                          {r.title}
                        </a>
                      ) : r.title}
                    </span>
                  </CheckItem>
                ))}
              </div>
            )}

            {/* Actions Tab */}
            {activeSection === 'actions' && (
              <div>
                {mod.actions && mod.actions.map((a, i) => (
                  <CheckItem key={i} checked={!!progress[`${mod.id}-a${i}`]} onToggle={() => toggle(`${mod.id}-a${i}`)}>
                    {t(a.en, a.zh)}
                  </CheckItem>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

/* ─── Main App ─── */
export default function CPTEDApp() {
  const [lang, setLang] = useState('zh')
  const [theme, setTheme] = useState('dark')
  const [tab, setTab] = useState(0)
  const [expandedModule, setExpandedModule] = useState(null)
  const [activeSection, setActiveSection] = useState('content')
  const [progress, setProgress] = useState({})
  const [loading, setLoading] = useState(true)

  const t = useCallback((en, zh) => lang === 'zh' ? (zh || en) : en, [lang])
  const allModules = PHASES.flatMap(p => p.modules)

  // Load progress
  useEffect(() => {
    setProgress(loadProgress())
    setLoading(false)
  }, [])

  // Save progress
  useEffect(() => {
    if (loading) return
    const timer = setTimeout(() => saveProgress(progress), 500)
    return () => clearTimeout(timer)
  }, [progress, loading])

  // Theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const toggle = useCallback((key) => {
    setProgress(p => {
      const n = { ...p }
      if (n[key]) delete n[key]; else n[key] = Date.now()
      return n
    })
  }, [])

  const getModPct = useCallback((m) => {
    const tot = (m.actions?.length || 0) + (m.readings?.length || 0)
    if (!tot) return 0
    let d = 0
    m.actions?.forEach((_, i) => { if (progress[`${m.id}-a${i}`]) d++ })
    m.readings?.forEach((_, i) => { if (progress[`${m.id}-r${i}`]) d++ })
    return Math.round(d / tot * 100)
  }, [progress])

  const getPhasePct = useCallback((p) => {
    let tot = 0, d = 0
    p.modules.forEach(m => {
      tot += (m.actions?.length || 0) + (m.readings?.length || 0)
      m.actions?.forEach((_, i) => { if (progress[`${m.id}-a${i}`]) d++ })
      m.readings?.forEach((_, i) => { if (progress[`${m.id}-r${i}`]) d++ })
    })
    return tot ? Math.round(d / tot * 100) : 0
  }, [progress])

  const getOverall = useCallback(() => {
    let tot = 0, d = 0
    PHASES.forEach(p => p.modules.forEach(m => {
      tot += (m.actions?.length || 0) + (m.readings?.length || 0)
      m.actions?.forEach((_, i) => { if (progress[`${m.id}-a${i}`]) d++ })
      m.readings?.forEach((_, i) => { if (progress[`${m.id}-r${i}`]) d++ })
    }))
    return tot ? Math.round(d / tot * 100) : 0
  }, [progress])

  const getCUCoverage = useCallback(() => {
    const cuMap = {}
    ALL_CU.forEach(cu => { cuMap[cu.id] = { ...cu, modules: [], done: false } })
    PHASES.forEach(p => p.modules.forEach(m => {
      m.iccp?.forEach(cuId => { if (cuMap[cuId]) cuMap[cuId].modules.push(m.id) })
    }))
    Object.keys(cuMap).forEach(cuId => {
      const mods = cuMap[cuId].modules
      cuMap[cuId].done = mods.some(mId => {
        const mod = allModules.find(m => m.id === mId)
        return mod && getModPct(mod) >= 80
      })
    })
    return cuMap
  }, [progress, getModPct, allModules])

  if (loading) {
    return <div style={{ background: 'var(--bg)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-3)' }}>{t('Loading...', '載入中...')}</div>
  }

  const tabs = [
    { id: 'roadmap', en: 'Roadmap', zh: '學習路線' },
    { id: 'matrix', en: 'ICCP Matrix', zh: 'ICCP 能力矩陣' },
  ]

  return (
    <div style={{ background: 'var(--bg)', minHeight: '100vh', color: 'var(--text-1)' }}>
      {/* Header */}
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: `${S.md}px ${S.lg}px`, borderBottom: '1px solid var(--border)', background: 'var(--surface)' }}>
        <div>
          <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.02em' }}>
            {t('CPTED Mastery', 'CPTED 精通學習計畫')}
          </h1>
          <div style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--mono)', marginTop: 2 }}>
            {t('ICA ICCP Certification Path', 'ICA ICCP 認證路徑')} · v2.3
          </div>
        </div>
        <div style={{ display: 'flex', gap: S.sm }}>
          <button onClick={() => setLang(l => l === 'zh' ? 'en' : 'zh')} style={toggleBtnStyle}>{lang === 'zh' ? 'EN' : '中'}</button>
          <button onClick={() => setTheme(t => t === 'dark' ? 'light' : 'dark')} style={toggleBtnStyle}>{theme === 'dark' ? '☀' : '◐'}</button>
        </div>
      </header>

      {/* Top Tabs */}
      <nav style={{ display: 'flex', gap: S.xs, padding: `${S.sm}px ${S.lg}px`, borderBottom: '1px solid var(--border)', background: 'var(--surface)', overflowX: 'auto' }}>
        {tabs.map((tb, i) => (
          <button key={tb.id} onClick={() => setTab(i)} style={{
            padding: `${S.sm}px ${S.md}px`, borderRadius: 20, fontSize: 14, fontWeight: tab === i ? 600 : 400,
            cursor: 'pointer', background: tab === i ? 'var(--accent)' : 'transparent',
            color: tab === i ? '#fff' : 'var(--text-2)', border: 'none', whiteSpace: 'nowrap', fontFamily: 'var(--font)'
          }}>{t(tb.en, tb.zh)}</button>
        ))}
      </nav>

      {/* Main Content */}
      <main style={{ padding: S.lg, maxWidth: 900, margin: '0 auto' }}>
        {tab === 0 && (
          <RoadmapTab
            progress={progress} toggle={toggle} t={t}
            expandedModule={expandedModule} setExpandedModule={setExpandedModule}
            activeSection={activeSection} setActiveSection={setActiveSection}
            getModPct={getModPct} getPhasePct={getPhasePct} getOverall={getOverall}
            allModules={allModules}
          />
        )}
        {tab === 1 && (
          <CompetencyTab t={t} getCUCoverage={getCUCoverage} getModPct={getModPct} allModules={allModules} />
        )}
      </main>

      <footer style={{ textAlign: 'center', padding: S.lg, color: 'var(--text-3)', fontSize: 13, fontFamily: 'var(--mono)' }}>
        {t('CPTED Mastery · ICA ICCP 11 Competency Units · ISO 22341:2021', 'CPTED 精通 · ICA ICCP 11 項能力單元 · ISO 22341:2021')}
      </footer>
    </div>
  )
}

const toggleBtnStyle = {
  padding: `${S.xs}px ${S.sm}px`, borderRadius: 6, fontSize: 14, fontWeight: 600,
  cursor: 'pointer', border: '1px solid var(--border)', background: 'transparent',
  color: 'var(--text-2)', fontFamily: 'var(--font)'
}

/* ─── Roadmap Tab ─── */
function RoadmapTab({ progress, toggle, t, expandedModule, setExpandedModule, activeSection, setActiveSection, getModPct, getPhasePct, getOverall, allModules }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.xl }}>
      {/* Overall Progress */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: S.lg }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: S.md }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>{t('Overall Progress', '整體學習進度')}</span>
          <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--accent)', fontFamily: 'var(--mono)' }}>{getOverall()}%</span>
        </div>
        <ProgressBar pct={getOverall()} height={8} />
        <div style={{ display: 'flex', gap: S.md, marginTop: S.md, flexWrap: 'wrap' }}>
          {PHASES.map(p => (
            <div key={p.id} style={{ display: 'flex', alignItems: 'center', gap: S.xs }}>
              <div style={{ width: 10, height: 10, borderRadius: 3, background: `var(${p.color})` }} />
              <span style={{ fontSize: 14, color: 'var(--text-2)' }}>{t(p.en, p.zh)} {getPhasePct(p)}%</span>
            </div>
          ))}
        </div>
      </div>

      {/* Phases */}
      {PHASES.map(phase => (
        <div key={phase.id}>
          <div style={{ display: 'flex', alignItems: 'center', gap: S.sm, marginBottom: S.md }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', background: `var(${phase.color})18` }}>
              <Icon d={phase.icon} size={22} color={`var(${phase.color})`} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: S.sm }}>
                <span style={{ fontSize: 13, fontWeight: 700, color: `var(${phase.color})`, fontFamily: 'var(--mono)', letterSpacing: '0.05em' }}>
                  PHASE {phase.num}
                </span>
                <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-1)' }}>{t(phase.en, phase.zh)}</span>
              </div>
              <span style={{ fontSize: 13, color: 'var(--text-3)', fontFamily: 'var(--mono)' }}>
                {t(`Weeks ${phase.weekRange}`, `第 ${phase.weekRange} 週`)}
              </span>
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: S.sm }}>
            {phase.modules.map(mod => (
              <ModuleCard key={mod.id} mod={mod} phase={phase}
                expandedModule={expandedModule} setExpandedModule={setExpandedModule}
                activeSection={activeSection} setActiveSection={setActiveSection}
                progress={progress} toggle={toggle} getModPct={getModPct} t={t}
                allModules={allModules}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}

/* ─── Competency Matrix Tab ─── */
function CompetencyTab({ t, getCUCoverage, getModPct, allModules }) {
  const cuMap = getCUCoverage()
  const practitioner = ALL_CU.filter(c => c.level === 'P')
  const professional = ALL_CU.filter(c => c.level === 'Pro')
  const practDone = practitioner.filter(c => cuMap[c.id].done).length
  const profDone = professional.filter(c => cuMap[c.id].done).length

  function CURow({ cu }) {
    const data = cuMap[cu.id]
    const relatedMods = data.modules.map(mId => allModules.find(m => m.id === mId)).filter(Boolean)
    return (
      <div style={{
        display: 'flex', alignItems: 'center', gap: S.md, padding: `${S.sm}px ${S.md}px`,
        background: data.done ? 'var(--success)08' : 'transparent', borderRadius: 8,
        border: `1px solid ${data.done ? 'var(--success)22' : 'var(--border)'}`
      }}>
        <div style={{
          width: 28, height: 28, minWidth: 28, borderRadius: 14,
          background: data.done ? 'var(--success)' : 'var(--surface-2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center'
        }}>
          {data.done ? (
            <svg width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth={3} strokeLinecap="round">
              <path d="M20 6L9 17l-5-5" />
            </svg>
          ) : (
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-3)' }}>{cu.id.replace('CU#', '')}</span>
          )}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)' }}>{cu.id}: {t(cu.en, cu.zh)}</div>
          <div style={{ fontSize: 13, color: 'var(--text-3)', marginTop: 2 }}>
            {relatedMods.length > 0 ? relatedMods.map(m => t(m.en, m.zh)).join(', ') : t('No linked modules', '無對應模組')}
          </div>
        </div>
        <span style={{
          fontSize: 12, fontWeight: 600, padding: '2px 8px', borderRadius: 4,
          background: cu.level === 'Pro' ? 'var(--accent-3)22' : 'var(--accent)22',
          color: cu.level === 'Pro' ? 'var(--accent-3)' : 'var(--accent)', fontFamily: 'var(--mono)'
        }}>
          {cu.level === 'Pro' ? t('PRO', '專業級') : t('PRACTITIONER', '執業者')}
        </span>
      </div>
    )
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: S.lg }}>
      {/* Summary */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: S.lg }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: S.sm }}>
          {t('ICCP Certification Progress', 'ICCP 認證進度')}
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.8, color: 'var(--text-2)', marginBottom: S.md }}>
          {t('8 competency units for Practitioner, all 11 for Professional. Modules at 80%+ count as evidence.',
            '執業者等級需 8 項能力單元，專業級需全部 11 項。模組完成度 80% 以上即計為能力證據。')}
        </p>
        <div style={{ display: 'flex', gap: S.lg, flexWrap: 'wrap' }}>
          {[{ label: t('Practitioner', '執業者'), done: practDone, total: 8, color: 'var(--accent)' },
            { label: t('Professional', '專業級'), done: practDone + profDone, total: 11, color: 'var(--accent-3)' }
          ].map((item, i) => (
            <div key={i} style={{ flex: 1, minWidth: 150, background: 'var(--surface-2)', borderRadius: 8, padding: S.md, textAlign: 'center' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>{item.label}</div>
              <div style={{ fontSize: 28, fontWeight: 700, color: item.color, fontFamily: 'var(--mono)', marginTop: S.xs }}>{item.done}/{item.total}</div>
              <ProgressBar pct={item.done / item.total * 100} color={item.color} height={4} />
            </div>
          ))}
        </div>
      </div>

      {/* CU Lists */}
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: S.sm }}>
          {t('Practitioner (8 required)', '執業者能力（需 8 項）')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
          {practitioner.map(cu => <CURow key={cu.id} cu={cu} />)}
        </div>
      </div>
      <div>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-3)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: S.sm }}>
          {t('Professional (3 additional)', '專業級能力（額外 3 項）')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: S.xs }}>
          {professional.map(cu => <CURow key={cu.id} cu={cu} />)}
        </div>
      </div>

      {/* Costs */}
      <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: 12, padding: S.lg }}>
        <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-1)', marginBottom: S.sm }}>
          {t('Certification Costs & Timeline', '認證費用與時程')}
        </div>
        <p style={{ fontSize: 16, lineHeight: 1.9, color: 'var(--text-2)' }}>
          {t('ICA Membership: ~CA$100/yr. ICCP Application: CA$275. CAP Class A course: varies. Re-certification: CA$85 every 3 years. Timeline: 6-8 months self-study + CAP course.',
            'ICA 會費：約 CA$100/年。ICCP 申請：CA$275。CAP Class A 課程：依機構而異。重新認證：每 3 年 CA$85。建議時程：6-8 個月自學 + CAP 課程。')}
        </p>
      </div>
    </div>
  )
}
