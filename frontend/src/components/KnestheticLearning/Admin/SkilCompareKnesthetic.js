import React from 'react'

function SkilCompareKnesthetic() {
  return (
    <div className="student-records-container">
      <div className='nav_bar_kin_admin'>
        <p className='kin_admin_nav ' onClick={() => (window.location.href = '/KnestheticAdmin')}>All Records</p>
        <p className='kin_admin_nav' onClick={() => (window.location.href = '/recordAnalysisKnesthetic')}>record Analysis</p>
        <p className='kin_admin_nav kin_admin_nav_active' onClick={() => (window.location.href = '/skilCompareKnesthetic')}>skill compare</p>
      </div>
    </div>
  )
}

export default SkilCompareKnesthetic
