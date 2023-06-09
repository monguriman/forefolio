import React, { useState, useEffect } from 'react';
import { Button, Form } from 'react-bootstrap';

import * as Api from '../../api';

import EducationForm from './EducationForm';
import EducationP from './EducationP';

function EducationDetail({ portfolioOwnerId, isEditable }) {
    const [dbItem, setDbItem] = useState([]);
    const [isToggle, setIsToggle] = useState(false); // 추가 버튼 클릭 유무
    const [isEdit, setIsEdit] = useState(false); // 편집 버튼 클릭 유무
    const [currentEditId, setcurrentEditId] = useState(''); // Edit 버튼을 클릭 시 버튼 표시를 구분하기 위한 값

    const [eduSchool, setEduSchool] = useState(''); // 학교이름
    const [eduMajor, setEduMajor] = useState(''); // 전공
    const [eduEnterDate, setEduEnterDate] = useState(''); // 입학일자
    const [eduGraduateDate, setEduGraduateDate] = useState(''); // 졸업일자
    const [eduDegree, setEduDegree] = useState(''); // 학위

    const isDateValid = eduEnterDate < eduGraduateDate;

    const onChangeSchool = (e) => {
        setEduSchool(e.target.value);
    };

    const onChangeMajor = (e) => {
        setEduMajor(e.target.value);
    };

    const onChangeEnterDate = (e) => {
        setEduEnterDate(e.target.value);
    };

    const onChangeGraduateDate = (e) => {
        setEduGraduateDate(e.target.value);
    };

    const onChangeDegree = (e) => {
        setEduDegree(e.target.value);
    };

    const AddInput = () => {
        setIsToggle(true);

        setEduSchool('');
        setEduMajor('');
        setEduEnterDate('');
        setEduGraduateDate('');
        setEduDegree('');
    };

    const fetchEducation = async (ownerId) => {
        try {
            // "/edu" 엔드포인트로 요청해 사용자 정보를 불러옴.(userId는 req.currentUserId 사용)
            const res = await Api.get('edu');
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
                if (!isDateValid) {
                    throw new Error('입학날짜보다 졸업일자가 이전입니다.');
                }

                try {
                    // "/edu" 엔드포인트로 post요청함.(userId는 req.currentUserId 사용)
                    await Api.post(`edu/`, {
                        eduSchool,
                        eduMajor,
                        eduEnterDate,
                        eduGraduateDate,
                        eduDegree,
                    });

                    setIsToggle(false);
                    setIsEdit(false);

                    fetchEducation({ userId });

                    setEduSchool('');
                    setEduMajor('');
                    setEduEnterDate('');
                    setEduGraduateDate('');
                    setEduDegree('');
                } catch (err) {
                    console.log('학위 추가에 실패하였습니다.', err);
                }
            } catch (err) {
                console.log(err);
            }
        } else {
            try {
                // "edu/educationId" 엔드포인트로 put요청함.
                await Api.put(`edu/${item._id}`, {
                    eduSchool,
                    eduMajor,
                    eduEnterDate,
                    eduGraduateDate,
                    eduDegree,
                });

                setIsToggle(false);
                setIsEdit(false);

                fetchEducation({ userId });
            } catch (err) {
                console.log('학위 수정에 실패하였습니다.', err);
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
        setEduSchool(item.eduSchool);
        setEduMajor(item.eduMajor);
        setEduEnterDate(item.eduEnterDate);
        setEduGraduateDate(item.eduGraduateDate);
        setEduDegree(item.eduDegree);

        setcurrentEditId(item._id);
        setIsEdit(true);
    };

    const handleCancel = () => {
        fetchEducation({ userId });

        setIsToggle(false);
        setIsEdit(false);
    };

    const handleDelete = async (id) => {
        try {
            // "edu/educationId" 엔드포인트로 delete 요청함.
            await Api.delete(`edu/${id}`);

            fetchEducation({ userId });

            setIsToggle(false);
            setIsEdit(false);
        } catch (err) {
            console.log('학위 삭제에 실패하였습니다.', err);
        }
    };

    useEffect(() => {
        fetchEducation({ userId });
    }, [userId]);

    const formSendFunction = {
        handleSubmit,
        handleCancel,
        handleDelete,
        onChangeSchool,
        onChangeMajor,
        onChangeEnterDate,
        onChangeGraduateDate,
        onChangeDegree,
    };
    const formSendcurrentData = { eduSchool, eduMajor, eduEnterDate, eduGraduateDate, eduDegree, currentEditId };
    const formSendisFlag = { isDateValid };
    const pSendFunction = { handleEdit };
    const pSendisFlag = { isEditable };

    return (
        <div>
            {dbItem.map((item) => (
                <div key={item._id}>
                    {item.isSave === true && item.isEdit === false ? (
                        <EducationP pSendFunction={pSendFunction} isFlag={pSendisFlag} item={item} />
                    ) : (
                        <EducationForm formSendFunction={formSendFunction} currentData={formSendcurrentData} isFlag={formSendisFlag} item={item} />
                    )}
                </div>
            ))}
            {isToggle === true ? (
                <div>
                    <div className='mb-2'>
                        <Form.Control style={{ width: '100%' }} type='text' placeholder='학교이름' value={eduSchool} onChange={onChangeSchool} />
                    </div>
                    <div className='mb-2'>
                        <Form.Control style={{ width: '100%' }} type='text' placeholder='전공' value={eduMajor} onChange={onChangeMajor} />
                    </div>
                    <div className='mb-2'>
                        <Form.Control
                            style={{ width: '100%' }}
                            type='date'
                            placeholder='입학일자'
                            value={eduEnterDate}
                            onChange={onChangeEnterDate}
                        />
                    </div>
                    <div className='mb-2'>
                        <Form.Control
                            style={{ width: '100%' }}
                            type='date'
                            placeholder='졸업일자'
                            value={eduGraduateDate}
                            onChange={onChangeGraduateDate}
                        />
                        {eduEnterDate && eduGraduateDate && !isDateValid && (
                            <Form.Text className='date-success'>입학날짜보다 졸업일자가 이전입니다.</Form.Text>
                        )}
                    </div>
                    <div className='mb-2'>
                        <Form.Control style={{ width: '100%' }} type='text' placeholder='학위' value={eduDegree} onChange={onChangeDegree} />
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

export default EducationDetail;
