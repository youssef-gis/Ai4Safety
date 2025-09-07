import {Body, Head, Html, Container, Section, Tailwind, Text, Button} from "@react-email/components";

type EmailPasswordResetProps ={
    toName:string,
    url:string,
}
const EmailPasswordReset = ({toName, url}:EmailPasswordResetProps) => {
    return ( 
        <Html>
            <Head />
            <Tailwind>
                <Body className="font-sans m-8 text-center" >
                    <Container>
                        <Section>
                            <Text>
                            Hello {toName}, you have requested to change your password
                            </Text>
                        </Section>
                        <Section>
                            <Button href={url}
                                className="bg-black rounded text-white p-2 m-2" >
                                Reset Password
                            </Button>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
     );
}
 
export default EmailPasswordReset;