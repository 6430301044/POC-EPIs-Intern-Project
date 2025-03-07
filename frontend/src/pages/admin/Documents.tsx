import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'
import React from 'react'

export default function Documents() {
  return (
    <>
        <Container>
            <SectionTitle 
                title='Documents'
                align='center'
            />
            <div>
                Hi there! I am the Documents.tsx page.
            </div>
        </Container>
    </>
  )
}
