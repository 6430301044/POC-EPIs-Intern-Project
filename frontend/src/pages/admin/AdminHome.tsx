import { Container } from '@/components/template/Container'
import { SectionTitle } from '@/components/template/SectionTitle'

export default function AdminHome() {
  return (
    <>
        <Container>
            <SectionTitle
                title='Admin'
                align='center'
            />
            <div className='text-9xl text-black dark:text-white'>
                Hi there! I am the AdminHome.tsx page.
            </div>
        </Container>
    </>
  )
}
