import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Profile() {
  return (
    <>
        <Container>
            <SectionTitle 
                title='Profile'
                align='center'
            />
            <div>
                Hi there! I am the Profile.tsx page.
            </div>
        </Container>
    </>
  )
}
