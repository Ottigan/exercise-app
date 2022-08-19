import { Exercise } from '@prisma/client';
import Button from 'components/Button';
import Input from 'components/Input';
import { GetServerSideProps } from 'next';
import { authOptions, UserWithId } from 'pages/api/auth/[...nextauth].next';
import { ChangeEvent, FormEvent, useCallback, useEffect, useReducer, useState } from 'react';
import { getServerSession } from 'utils/auth';
import { db } from 'utils/db';
import Head from 'next/head';
import useModal from 'hooks/useModal';
import Modal from 'components/Modal';
import useFetch from 'hooks/useFetch';
import { formDataTemplate, reducer } from './utils';
import Exercises from './components/Exercises';

interface ExercisesProps {
  exercises: Exercise[];
}

export default function Page(props: ExercisesProps) {
  const [exercises, setExercises] = useState(props.exercises);
  const [formData, handleFormData] = useReducer(reducer, formDataTemplate);
  const [isModalVisible, handleModalVisibility] = useModal();
  const [modalType, setModalType] = useState<'create' | 'update'>('create');
  const exerciseController = useFetch<Exercise[]>();

  const handleCreate = useCallback((e: FormEvent) => {
    e.preventDefault();

    exerciseController.exec({
      url: '/api/exercises',
      options: {
        method: 'POST',
        body: JSON.stringify(formData),
      },
      onSucess: () => {
        handleFormData({ type: 'clear' });
        handleModalVisibility();
      },
    });
  }, [exerciseController, formData, handleModalVisibility]);

  const handleUpdate = useCallback((e: FormEvent) => {
    e.preventDefault();

    exerciseController.exec({
      url: '/api/exercises',
      options: {
        method: 'PATCH',
        body: JSON.stringify(formData),
      },
      onSucess: () => {
        handleFormData({ type: 'clear' });
        handleModalVisibility();
      },
    });
  }, [exerciseController, formData, handleModalVisibility]);

  const handleDelete = useCallback((id: string) => exerciseController.exec({
    url: `/api/exercises?id=${id}`,
    options: {
      method: 'DELETE',
    },
  }), [exerciseController]);

  useEffect(() => {
    if (exerciseController.data) {
      setExercises(exerciseController.data);
    }
  }, [exerciseController.data]);

  const handleChange = useCallback((e: ChangeEvent<HTMLInputElement>) => {
    const { target: { value, name } } = e;

    handleFormData({ type: name, payload: value });
  }, []);

  const handleView = useCallback((exercise: Exercise) => {
    handleFormData({ type: 'set', payload: exercise });
    setModalType('update');
    handleModalVisibility();
  }, [handleModalVisibility]);

  return (
    <>
      <Head>
        <title>MyGymPal</title>
        <meta name="description" content="Generated by create next app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <main className="p-3">
        <Button
          onClick={() => {
            setModalType('create');
            handleFormData({ type: 'clear' });
            handleModalVisibility();
          }}
          disabled={exerciseController.isLoading}
          className="basis-4/12 mb-3"
        >
          Create

        </Button>
        <Modal isVisible={isModalVisible} visibilityHandler={handleModalVisibility}>
          <form className="flex flex-wrap gap-2 mb-9" autoComplete="off">
            <Input
              onChange={handleChange}
              value={formData.name}
              label="Name"
              name="name"
            />
            <Input
              onChange={handleChange}
              value={formData.description}
              label="Description"
              name="description"
            />
            <Input
              onChange={handleChange}
              value={formData.sets}
              label="Sets"
              name="sets"
              type="number"
              min={0}
            />
            <Input
              onChange={handleChange}
              value={formData.reps}
              label="Reps"
              name="reps"
              type="number"
              min={0}
            />
            <Input
              onChange={handleChange}
              value={formData.rest}
              label="Rest (minutes)"
              name="rest"
              type="number"
              step="0.1"
              min={0}
            />
            <Input
              onChange={handleChange}
              value={formData.weight}
              label="Weight"
              name="weight"
              type="number"
              step="0.1"
              min={0}
              className="mb-3"
            />
            {modalType === 'create'
              ? (
                <Button
                  onClick={handleCreate}
                  type="submit"
                  disabled={exerciseController.isLoading}
                  className="basis-4/12"
                >
                  Create
                </Button>
              )
              : (
                <Button
                  onClick={handleUpdate}
                  type="submit"
                  disabled={exerciseController.isLoading}
                  className="basis-4/12"
                >
                  Update
                </Button>
              )}
          </form>
        </Modal>
        <Exercises
          isLoading={exerciseController.isLoading}
          exercises={exercises}
          handleView={handleView}
          handleDelete={handleDelete}
        />
      </main>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async (context) => {
  const session = await getServerSession(context.req, context.res, authOptions);

  const exercises = await db.exercise.findMany({ where: { userId: (session?.user as UserWithId).id } });

  return { props: { exercises } };
};
