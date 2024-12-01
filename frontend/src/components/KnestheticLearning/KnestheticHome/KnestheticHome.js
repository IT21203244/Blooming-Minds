import React from 'react'
import Letter from './img/letter.png'
import Action from './img/action.png'
import './kinhome.css'
function KnestheticHome() {
  return (
    <div>
      <div className='kin_home_main'>
        <div className='kin_home_one_row'>
          <div>
            <p className='topi_main'>Verb Master</p>
          </div>
        </div>
        <p className='dwon_topic'>Select Your Today Task</p>
        <div className='kin_home_two_row'>
          <div className='kin_home_card_continer'>
            <div className='_king_home_card'>
              <img src={Letter} alt='letercard' className='card_image_kin' />
              <p className='card_link'>Letter Quest</p>
            </div>
            <div onClick={() => (window.location.href = '/SmileDetection')} className='_king_home_card'>
              <img src={Action} alt='Actioncard' className='card_image_kin' />
              <p className='card_link'>Action Quest</p>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}

export default KnestheticHome
