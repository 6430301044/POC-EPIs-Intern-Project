import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Settings() {
  return (
    <>
        <Container>
            <SectionTitle 
                title='Setting'
                align='center'
            />
            <div>
                Hi there! I am the Setting.tsx page.
            </div>
        </Container>
    </>
  )
}
