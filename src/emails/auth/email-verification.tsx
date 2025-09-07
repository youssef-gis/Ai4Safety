import { Body, Head, Html, Container,
     Section, Tailwind, Text } from "@react-email/components";

type EmailVerificationProps = {
    toName: string,
    code: string,
}
const EmailVerification = ({ toName, code }: EmailVerificationProps) => {
    return (
        <Html>
            <Head />
            <Tailwind>
                <Body className="font-sans m-8 text-center" >
                    <Container>
                        <Section>
                            <Text>
                                Hello {toName}, Please verify your code 
                                by using the code below
                            </Text>
                        </Section>
                        <Section>
                            <Text 
                                className="bg-black rounded text-white p-2 m-2" >
                                {code}
                            </Text>
                        </Section>
                    </Container>
                </Body>
            </Tailwind>
        </Html>
    );
}

export default EmailVerification;