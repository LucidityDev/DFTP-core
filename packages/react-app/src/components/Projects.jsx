import React from 'react';
import { Card, Heading, Image, Box } from 'rimble-ui';

const Project = ({ title }) => (
    <Card width={"auto"} maxWidth={"420px"} mx={"auto"} my={5} p={0}>
        <Image
            width={1}
            src="https://source.unsplash.com/random/1280x720"
            alt="random image from unsplash.com"
        />

        <Box px={[3, 3, 4]} py={3}>
            <Heading.h2>{title}</Heading.h2>
            <Heading.h5 color="#666">Card sub-title</Heading.h5>
        </Box>
    </Card>
)

const Projects = props => {
    return (
        <>
            <Card>
                <Heading as={"h1"}>Projects</Heading>
                <Heading as={"h3"}>Track projects from start to completion</Heading>
                <Project title="Sustainable agriculture for small coffee farms" />
                <Project title="Sustainable agriculture for small coffee farms" />
                <Project title="Sustainable agriculture for small coffee farms" />
            </Card>
        </>
    );
}

export default Projects;