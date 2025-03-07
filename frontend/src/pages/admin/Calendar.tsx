import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Calendar() {
  return (
    <>
        <Container>
            <SectionTitle
                title='Calendar'
                align='center'
            />
            <div className='text-9xl text-black'>
                Hi there! I am the Calendar.tsx page.
            </div>
        </Container>
    </>
  )
}
