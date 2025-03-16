import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Adiolog() {
  return (
    <>
        <Container>
            <SectionTitle 
                title='Audiolog'
                align='center'
            />
            <div>
                Hi there! I am the Audiolog.tsx page.
            </div>
        </Container>
    </>
  )
}
