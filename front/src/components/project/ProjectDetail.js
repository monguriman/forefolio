import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';

import * as Api from '../../api';

import ProjectForm from './ProjectForm';
import ProjectP from './ProjectP';

function ProjectDetail({ portfolioOwnerId, isEditable }) {
    const [dbItem, setDbItem] = useState([]);
    const [isToggle, setIsToggle] = useState(false); // 추가 버튼 클릭 유무
    const [isEdit, setIsEdit] = useState(false); // 편집 버튼 클릭 유무
    const [currentEditId, setcurrentEditId] = useState(''); // Edit 버튼을 클릭 시 버튼 표시를 구분하기 위한 값

    const [projectName, setProjectName] = useState(''); // 프로젝트 이름
    const [projectStartDate, setProjectStartDate] = useState(''); // 프로젝트 시작일자
    const [projectEndDate, setProjectEndDate] = useState(''); // 프로젝트 종료일자
    const [projectDescription, setProjectDescription] = useState(''); // 프로젝트 설명

    const onChangeName = (e) => {
        setProjectName(e.target.value);
    };

    const onChangeStartDate = (e) => {
        setProjectStartDate(e.target.value);
    };

    const onChangeEndDate = (e) => {
        setProjectEndDate(e.target.value);
    };

    const onChangeDescription = (e) => {
        setProjectDescription(e.target.value);
    };

    const AddInput = () => {
        setIsToggle(true);

        setProjectName('');
        setProjectStartDate('');
        setProjectEndDate('');
        setProjectDescription('');
    };

    const fetchProject = async (ownerId) => {
        try {
            // "/project" 엔드포인트로 요청해 사용자 정보를 불러옴.(userId는 req.currentUserId 사용)
            const res = await Api.get('project');
            // 사용자 정보는 response의 data임.
            const ownerData = res.data;
            // portfolioOwner을 해당 사용자 정보로 세팅함.
            setDbItem(ownerData);
        } catch (err) {
            console.log('DB 불러오기를 실패하였습니다.', err);
        }
    };

    const userId = portfolioOwnerId;

    const handleSubmit = async (id) => {
        const item = dbItem.filter((item) => item._id === id)[0];

        if (item === undefined || item.isSave === false) {
            try {
                // "/project" 엔드포인트로 post요청함.(userId는 req.currentUserId 사용)
                await Api.post(`project/`, {
                    projectName,
                    projectStartDate,
                    projectEndDate,
                    projectDescription,
                });

                setIsToggle(false);
                setIsEdit(false);

                fetchProject({ userId });

                setProjectName('');
                setProjectStartDate('');
                setProjectEndDate('');
                setProjectDescription('');
            } catch (err) {
                console.log('프로젝트 추가에 실패하였습니다.', err);
            }
        } else {
            try {
                // "project/projectId" 엔드포인트로 put요청함.
                await Api.put(`project/${item._id}`, {
                    projectName,
                    projectStartDate,
                    projectEndDate,
                    projectDescription,
                });

                setIsToggle(false);
                setIsEdit(false);

                fetchProject({ userId });
            } catch (err) {
                console.log('프로젝트 수정에 실패하였습니다.', err);
            }
        }
    };

    const handleEdit = (id) => {
        setDbItem((prevItems) => {
            return prevItems.map((item) => {
                if (item._id === id) {
                    return {
                        ...item,
                        isEdit: true,
                    };
                } else {
                    return item;
                }
            });
        });

        const item = dbItem.filter((item) => item._id === id)[0];
        setProjectName(item.projectName);
        setProjectStartDate(item.projectStartDate);
        setProjectEndDate(item.projectEndDate);
        setProjectDescription(item.projectDescription);

        setcurrentEditId(item._id);
        setIsEdit(true);
    };

    const handleCancel = () => {
        fetchProject({ userId });

        setIsToggle(false);
        setIsEdit(false);
    };

    const handleDelete = async (id) => {
        try {
            // "project/projectId" 엔드포인트로 delete 요청함.
            await Api.delete(`cert/${id}`);

            fetchProject({ userId });

            setIsToggle(false);
            setIsEdit(false);
        } catch (err) {
            console.log('프로젝트 삭제에 실패하였습니다.', err);
        }
    };

    useEffect(() => {
        fetchProject({ userId });
    }, [userId]);

    const formSendFunction = { handleSubmit, handleCancel, handleDelete, onChangeName, onChangeStartDate, onChangeEndDate, onChangeDescription };
    const formSendcurrentData = { projectName, projectStartDate, projectEndDate, projectDescription, currentEditId };
    const pSendFunction = { handleEdit };
    const pSendisFlag = { isEditable };

    return (
        <div>
            {dbItem.map((item) => (
                <div key={item._id}>
                    {item.isSave === true && item.isEdit === false ? (
                        <ProjectP pSendFunction={pSendFunction} isFlag={pSendisFlag} item={item} />
                    ) : (
                        <ProjectForm formSendFunction={formSendFunction} currentData={formSendcurrentData} item={item} />
                    )}
                </div>
            ))}
            {isToggle === true ? (
                <div>
                    <div className='mb-2'>
                        <Form.Control style={{ width: '100%' }} type='text' placeholder='프로젝트 명' value={projectName} onChange={onChangeName} />
                    </div>
                    <div className='mb-2'>
                        <Form.Control
                            style={{ width: '100%' }}
                            type='date'
                            placeholder='프로젝트 시작일자'
                            value={projectStartDate}
                            onChange={onChangeStartDate}
                        />
                    </div>
                    <div className='mb-2'>
                        <Form.Control
                            style={{ width: '100%' }}
                            type='date'
                            placeholder='프로젝트 종료일자'
                            value={projectEndDate}
                            onChange={onChangeEndDate}
                        />
                    </div>
                    <div className='mb-2'>
                        <Form.Control
                            style={{ width: '100%' }}
                            type='text'
                            placeholder='프로젝트 설명'
                            value={projectDescription}
                            onChange={onChangeDescription}
                        />
                    </div>
                    <div className='mb-3 text-center'>
                        <React.Fragment>
                            <Button variant='primary' onClick={() => handleSubmit()}>
                                확인
                            </Button>
                            <Button variant='secondary' onClick={() => handleCancel()}>
                                취소
                            </Button>
                        </React.Fragment>
                    </div>
                </div>
            ) : (
                ''
            )}
            {isEditable && (
                <div className='mb-3 text-center'>
                    {dbItem.length < 10 && (
                        <Button variant='primary' onClick={AddInput} disabled={isToggle || isEdit ? true : false}>
                            +
                        </Button>
                    )}
                </div>
            )}
        </div>
    );
}

export default ProjectDetail;
