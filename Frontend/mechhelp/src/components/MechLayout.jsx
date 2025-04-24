import React from 'react'
import { Outlet } from 'react-router-dom'
import MechNavBar from './MechNavBar'

const MechLayout = () => {
  return (
    <> 
    <MechNavBar/>
    <Outlet/>
    </>
  )
}

export default MechLayout