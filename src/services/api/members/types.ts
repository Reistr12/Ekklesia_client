export type MemberMetric = {
  label: string
  value: string
  trend: string
}

export type Member = {
  id: string
  name: string
  phone: string
  dateOfBirth: string
  dateOfBirthIso: string
  contact: string
  status: string
}

export type MembersData = {
  metrics: MemberMetric[]
  members: Member[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export type CreateMemberPayload = {
  name: string
  phone?: string
  dateOfBirth: string
}

export type CreateMemberResponse = {
  id: string
  name: string
  phone?: string
  dateOfBirth: string
}

export type UpdateMemberPayload = Partial<CreateMemberPayload>

export type UpdateMemberResponse = CreateMemberResponse
