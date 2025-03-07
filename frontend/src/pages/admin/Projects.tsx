import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Projects() {
  return (
    <>
        <Container>
            <SectionTitle
                title='Projects'
                align='center'
            />
            <div className='text-9xl text-black'>
                Hi there! I am the Projects.tsx page.
            </div>
        </Container>
    </>
  )
}
