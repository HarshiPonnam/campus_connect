import { createFileRoute } from '@tanstack/react-router'
import { formatDistanceToNow } from 'date-fns'
import { Send } from 'lucide-react'
import { FormEvent, useState } from 'react'
import { DialogTrigger, Heading } from 'react-aria-components'
import { useAddGroupMember, useAuthContext, useCreateGroupMessage, useGetGroup, useGetGroupMessages } from '~/api/hooks'
import { Button } from '~/ui/Button'
import { Dialog } from '~/ui/Dialog'
import { StandardErrorBox } from '~/ui/ErrorBox'
import { Form } from '~/ui/Form'
import { Modal } from '~/ui/Modal'
import { ProgressBar } from '~/ui/ProgressBar'
import { Tab, TabList, TabPanel, Tabs } from '~/ui/Tabs'
import { TextField } from '~/ui/TextField'

export const Route = createFileRoute('/_authenticated/_layout/groups/$groupId')({
  component: RouteComponent,
  loader: () => ({
    title: 'Group'
  }),
})

function AddGroupMemberModal({ groupId }: { groupId: string }) {
  const [emailText, setEmailText] = useState("")
  const addMember = useAddGroupMember()

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!e.currentTarget.checkValidity()) {
      return
    }

    await addMember.mutateAsync({ id: groupId, email: emailText })
    setEmailText("")
  }

  return (
    <Modal isDismissable>
      <Dialog>
        <Heading slot="title" className="text-xl font-bold pb-4">Add member</Heading>

        <Form onSubmit={handleSubmit} className="flex flex-col space-y-2 pt-4">
          <TextField
            type='email'
            label='Email'
            value={emailText}
            onChange={setEmailText}
            isRequired
            isDisabled={addMember.isPending}
            placeholder="john@uky.edu"
          />

          <Button variant="primary" type="submit" isPending={addMember.isPending}>Add Member</Button>
          <Button variant="secondary" slot="close">Cancel</Button>

          <StandardErrorBox explanation="Failed to add group member" error={addMember.error} />
        </Form>
      </Dialog>
    </Modal>
  )
}

function GroupMessages({ groupId }: { groupId: string }) {
  const messages = useGetGroupMessages(groupId)
  const createMessage = useCreateGroupMessage()
  const messageData = messages.data?.data
  const [message, setMessage] = useState("")

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!message.trim().length) {
      return
    }

    await createMessage.mutateAsync({ id: groupId, text: message })
    setMessage("")
  }

  return (
    <>
      <StandardErrorBox
        error={messages.error}
        explanation="Failed to load messages"
        className="mt-12"
      />

      {messages.isPending && (
        <ProgressBar
          label="Loading messages..."
          className="mt-12"
          isIndeterminate
        />
      )}

      {messageData &&
        <>
          {messageData.length === 0 &&
            <div className="opacity-70">
              No messages yet. Start the chat!
            </div>
          }

          <div className='flex flex-col space-y-4'>
            {messageData.map(message => {
              return (
                <div key={message._id} className="flex flex-col">
                  <div className='flex flex-row justify-between'>
                    <span className="font-semibold">
                      {message.sender.name}
                    </span>
                    <span className="text-xs opacity-60">
                      {formatDistanceToNow(message.createdAt, { addSuffix: true })}
                    </span>
                  </div>
                  <span className="opacity-80">{message.text}</span>
                </div>
              )
            })}
          </div>

          <Form onSubmit={handleSubmit} className="flex flex-row pt-4">
            <TextField className="w-full" aria-label="Message" placeholder="Write a message..." value={message} onChange={setMessage} />
            <Button variant='icon' type='submit'><Send /></Button>
          </Form>

          <StandardErrorBox
            error={createMessage.error}
            explanation="Failed to send message"
            className="mt-12"
          />
        </>
      }
    </>
  )
}

function RouteComponent() {
  const route = Route.useParams()
  const group = useGetGroup(route.groupId)
  const groupData = group.data?.data
  const auth = useAuthContext()
  const isCreator = auth.user?.user.id === groupData?.createdBy._id

  return (
    <div className="flex flex-col lg:w-full lg:max-w-2xl lg:mx-auto py-6">
      <StandardErrorBox
        error={group.error}
        explanation="Failed to load group"
        className="mt-12"
      />

      {group.isPending && (
        <ProgressBar
          label="Loading group..."
          className="mt-12"
          isIndeterminate
        />
      )}

      {groupData &&
        <>
          <Heading className="text-lg font-semibold">{groupData.name}</Heading>
          <p>{groupData.description}</p>

          <Tabs>
            <TabList aria-label="Group categories">
              <Tab id="messages">Messages</Tab>
              <Tab id="members">Members</Tab>
            </TabList>
            <TabPanel id="messages">
              <GroupMessages groupId={route.groupId} />
            </TabPanel>
            <TabPanel id="members">
              <ul className="text-sm space-y-1">
                {groupData.members.length > 0 ? (
                  groupData.members.map((m) => (
                    <li key={m._id}>{m.name || m.email || m._id}</li>
                  ))
                ) : (
                  <li className="opacity-70">No members yet.</li>
                )}
              </ul>

              {isCreator &&
                <DialogTrigger>
                  <Button variant='secondary'>Add Member</Button>
                  <AddGroupMemberModal groupId={route.groupId} />
                </DialogTrigger>
              }
            </TabPanel>
          </Tabs>


        </>
      }
    </div>
  )
}
