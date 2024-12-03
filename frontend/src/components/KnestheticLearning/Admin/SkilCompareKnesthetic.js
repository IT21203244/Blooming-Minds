import React from 'react'

function SkilCompareKnesthetic() {
  return (
    <div>
      <div className='nav_bar_kin_admin main_nav'>
        <p className='kin_admin_nav kin_admin_nav_active_main' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>letter Quest</p>
        <p className='kin_admin_nav '>Action Quest</p>
        <p className='kin_admin_nav' onClick={() => (window.location.href = '/KnestheticHome')}>Logout</p>
      </div>
      <div className="student-records-container">
        <div className='nav_bar_kin_admin'>
          <p className='kin_admin_nav ' onClick={() => (window.location.href = '/KnestheticAdmin')}>All Records</p>
          <p className='kin_admin_nav' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>record Analysis</p>
          <p className='kin_admin_nav kin_admin_nav_active' onClick={() => (window.location.href = '/skilCompareKnesthetic')}>skill compare</p>
        </div>
      </div>
    </div>

  )
}

export default SkilCompareKnesthetic
