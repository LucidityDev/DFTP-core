import moment from 'moment';
import React, { useState } from 'react';
import Chart from 'react-apexcharts';
import { DateRangePicker, SingleDatePicker } from 'react-dates';
import { Card, Button, Form, Col, Row, InputGroup, Modal } from 'react-bootstrap';
// assets
import 'react-dates/lib/css/_datepicker.css';

const MilestoneForm = ({
    show,
    handleClose
}) => {
    const [endDate, setMilestoneEndDate] = useState(moment());
    const [focusedInput, setFocusedInput] = useState()
    return (
        <Modal show={show} onHide={handleClose}>
            <Modal.Header closeButton>
                <Modal.Title>New Milestone</Modal.Title>
            </Modal.Header>

            <Modal.Body>
                {/* Date */}
                <Form.Group as={Col}>
                    <Form.Label>End date</Form.Label>
                    <div>
                        <SingleDatePicker
                            date={endDate}
                            onDateChange={date => setMilestoneEndDate(date)}
                            focused={!!focusedInput}
                            onFocusChange={({ focused }) => setFocusedInput(focused)}
                            id="milestone_end_date"
                        />
                    </div>
                </Form.Group>
                {/* Budget */}
                {/* Description */}
            </Modal.Body>

            <Modal.Footer>
                <Button variant="secondary" onClick={handleClose}>Cancel</Button>
                <Button variant="primary">Add</Button>
            </Modal.Footer>
        </Modal>
    );
}

const ThreeDotDivider = () => (
    <div className='d-flex align-items-center justify-content-center my-2'>
        <span>&bull;&bull;&bull;</span>
    </div>
)

const GeneralInfoCard = () => {
    return (
        <Card>
            <Card.Header as="h5">General Info</Card.Header>
            <Card.Body>

                {/* 1st Row */}
                <Form.Row>
                    <Form.Group as={Col} md="6">
                        <h6>Title of Project</h6>
                        <Form.Label>Enter legal name of the project</Form.Label>
                        <Form.Control type="text" />
                    </Form.Group>

                    <Form.Group className="ml-1" as={Col} md="5">
                        <h6>Budget</h6>
                        <Form.Label>Specify funds alloted for project</Form.Label>
                        <InputGroup className="mb-2 mr-sm-2">
                            <Form.Control placeholder="Enter budget" />
                            <InputGroup.Append>
                                <InputGroup.Text>USD</InputGroup.Text>
                            </InputGroup.Append>
                        </InputGroup>
                    </Form.Group>
                </Form.Row>
                <ThreeDotDivider />

                {/* 2nd Row */}
                <Form.Row>
                    <Form.Group as={Col} md="6">
                        <h6>Project Abstract</h6>
                        <Form.Label>Add a comprehensive description of project</Form.Label>
                        <Form.Control as="textarea" placeholder="e.g Investment for coffee farmers" rows={3} />
                    </Form.Group>

                    <Form.Group className="ml-1" as={Col} md="5">
                        <h6>Token Name</h6>
                        <Form.Label>Token Factory will mint this governance token with such name</Form.Label>
                        <Form.Control type="text" placeholder="e.g HAP" rows={3} />
                    </Form.Group>
                </Form.Row>
                <ThreeDotDivider />
            </Card.Body>
        </Card>
    )
}

const MilestonesPlanCard = ({
    showMilestoneModal
}) => {
    const chartOptions = {
        options: {
            chart: {
                height: 350,
                type: 'radialBar',
            },
            plotOptions: {
                radialBar: {
                    hollow: {
                        size: '70%',
                    }
                },
            },
            labels: ['Cricket'],
        },
    };

    const series = [70];

    const [rangeDates, setDateRange] = useState({
        startDate: moment(),
        endDate: moment()
    })
    const [focusedInput, setFocusedInput] = useState(null)
    return (
        <Card>
            <Card.Header as="h5">Milestones Plan</Card.Header>
            <Card.Body>
                <Form.Row>
                    <Form.Group as={Col} md="6">
                        <h6>Start/End Dates</h6>
                        <Form.Label>Specify the dates</Form.Label>
                        <div>
                            <DateRangePicker
                                startDate={rangeDates.startDate}
                                startDateId="project_date_range_start"
                                endDate={rangeDates.endDate}
                                endDateId="project_date_range_end"
                                onDatesChange={({ startDate, endDate }) => setDateRange({
                                    startDate,
                                    endDate
                                })}
                                focusedInput={focusedInput}
                                onFocusChange={setFocusedInput}
                            />
                        </div>
                        <div style={{ marginTop: 16 }}>
                            <h6>Project Milestones</h6>
                            <Form.Label>Add a budget and timeline for milestones</Form.Label>
                            <Button style={{ width: '100%' }} onClick={showMilestoneModal}>
                                + Add milestiones
                            </Button>
                        </div>
                    </Form.Group>
                    <Form.Group as={Col} md="6">
                        <Chart options={chartOptions} series={series} type="radialBar" height="380" />
                    </Form.Group>
                </Form.Row>
                <ThreeDotDivider />
            </Card.Body>
        </Card>
    )
}

const ProjectForm = () => {
    const [shouldDisplayMilestoneDetails, addMilestoneDetails] = useState(false);
    const showMilestoneDetails = () => addMilestoneDetails(true)
    const hideMilestoneDetails = () => addMilestoneDetails(false)
    return (
        <>
            <MilestoneForm
                show={shouldDisplayMilestoneDetails}
                handleClose={hideMilestoneDetails} />
            <Row>
                <Col className="mt-4" style={{ marginLeft: 40 }}>
                    <h3>New Project</h3>
                </Col>
            </Row>
            <Form>
                <GeneralInfoCard />
                <MilestonesPlanCard showMilestoneModal={showMilestoneDetails} />
            </Form>
        </>
    )
}

export default ProjectForm;