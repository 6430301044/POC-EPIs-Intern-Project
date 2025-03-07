import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Team() {
  return (
    <>
        <Container>
            <SectionTitle
                title='Team'
                align='center'
            />
            <div>
                Hi there! I am the Team.tsx page.
            </div>
        </Container>
    </>
  )
}
