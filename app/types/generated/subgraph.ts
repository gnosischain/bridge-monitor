import { GraphQLClient } from 'graphql-request';
import * as Dom from 'graphql-request/dist/types.dom';
import gql from 'graphql-tag';
import { ClientError } from 'graphql-request/dist/types';
import useSWR, { SWRConfiguration as SWRConfigInterface, Key as SWRKeyInterface } from 'swr';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  BigDecimal: { input: any; output: any; }
  BigInt: { input: any; output: any; }
  Bytes: { input: any; output: any; }
  /**
   * 8 bytes signed integer
   *
   */
  Int8: { input: any; output: any; }
  /**
   * A string representation of microseconds UNIX timestamp (16 digits)
   *
   */
  Timestamp: { input: any; output: any; }
};

export type AmbTransaction = Transaction & {
  __typename?: 'AMBTransaction';
  bridgeName?: Maybe<Scalars['String']['output']>;
  execution?: Maybe<TransactionExecution>;
  id: Scalars['ID']['output'];
  initiator?: Maybe<Scalars['Bytes']['output']>;
  initiatorAmount?: Maybe<Scalars['BigInt']['output']>;
  initiatorNetwork?: Maybe<Scalars['String']['output']>;
  initiatorToken?: Maybe<Scalars['Bytes']['output']>;
  messageId?: Maybe<Scalars['Bytes']['output']>;
  receiver?: Maybe<Scalars['Bytes']['output']>;
  receiverAmount?: Maybe<Scalars['BigInt']['output']>;
  receiverNetwork?: Maybe<Scalars['String']['output']>;
  receiverToken?: Maybe<Scalars['Bytes']['output']>;
  timestamp?: Maybe<Scalars['BigInt']['output']>;
  transactionHash?: Maybe<Scalars['Bytes']['output']>;
  transactionStatus?: Maybe<TransactionStatus>;
  validations?: Maybe<Array<TransactionValidation>>;
};


export type AmbTransactionValidationsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TransactionValidation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TransactionValidation_Filter>;
};

export type AmbTransaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<AmbTransaction_Filter>>>;
  bridgeName?: InputMaybe<Scalars['String']['input']>;
  bridgeName_contains?: InputMaybe<Scalars['String']['input']>;
  bridgeName_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_ends_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeName_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeName_in?: InputMaybe<Array<Scalars['String']['input']>>;
  bridgeName_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeName_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_contains?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  bridgeName_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_starts_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution?: InputMaybe<Scalars['String']['input']>;
  execution_?: InputMaybe<TransactionExecution_Filter>;
  execution_contains?: InputMaybe<Scalars['String']['input']>;
  execution_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_ends_with?: InputMaybe<Scalars['String']['input']>;
  execution_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_gt?: InputMaybe<Scalars['String']['input']>;
  execution_gte?: InputMaybe<Scalars['String']['input']>;
  execution_in?: InputMaybe<Array<Scalars['String']['input']>>;
  execution_lt?: InputMaybe<Scalars['String']['input']>;
  execution_lte?: InputMaybe<Scalars['String']['input']>;
  execution_not?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  execution_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  execution_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  execution_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_starts_with?: InputMaybe<Scalars['String']['input']>;
  execution_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  initiator?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorAmount?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  initiatorAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  initiatorNetwork?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_ends_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initiatorNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initiatorNetwork_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_starts_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorToken?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiatorToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  messageId?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  messageId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<AmbTransaction_Filter>>>;
  receiver?: InputMaybe<Scalars['Bytes']['input']>;
  receiverAmount?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  receiverAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  receiverNetwork?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_ends_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  receiverNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  receiverNetwork_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_starts_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverToken?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiverToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiver_lt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionStatus?: InputMaybe<TransactionStatus>;
  transactionStatus_in?: InputMaybe<Array<TransactionStatus>>;
  transactionStatus_not?: InputMaybe<TransactionStatus>;
  transactionStatus_not_in?: InputMaybe<Array<TransactionStatus>>;
  validations_?: InputMaybe<TransactionValidation_Filter>;
};

export enum AmbTransaction_OrderBy {
  BridgeName = 'bridgeName',
  Execution = 'execution',
  ExecutionId = 'execution__id',
  ExecutionTimestamp = 'execution__timestamp',
  ExecutionTransactionHash = 'execution__transactionHash',
  ExecutionValidatorAddr = 'execution__validatorAddr',
  Id = 'id',
  Initiator = 'initiator',
  InitiatorAmount = 'initiatorAmount',
  InitiatorNetwork = 'initiatorNetwork',
  InitiatorToken = 'initiatorToken',
  MessageId = 'messageId',
  Receiver = 'receiver',
  ReceiverAmount = 'receiverAmount',
  ReceiverNetwork = 'receiverNetwork',
  ReceiverToken = 'receiverToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionStatus = 'transactionStatus',
  Validations = 'validations'
}

export enum Aggregation_Interval {
  Day = 'day',
  Hour = 'hour'
}

export type BlockChangedFilter = {
  number_gte: Scalars['Int']['input'];
};

export type Block_Height = {
  hash?: InputMaybe<Scalars['Bytes']['input']>;
  number?: InputMaybe<Scalars['Int']['input']>;
  number_gte?: InputMaybe<Scalars['Int']['input']>;
};

export enum BridgeType {
  Amb = 'AMB',
  Xdai = 'XDAI'
}

/** Defines the order direction, either ascending or descending */
export enum OrderDirection {
  Asc = 'asc',
  Desc = 'desc'
}

export type Query = {
  __typename?: 'Query';
  /** Access to subgraph metadata */
  _meta?: Maybe<_Meta_>;
  ambtransaction?: Maybe<AmbTransaction>;
  ambtransactions: Array<AmbTransaction>;
  transaction?: Maybe<Transaction>;
  transactionExecution?: Maybe<TransactionExecution>;
  transactionExecutions: Array<TransactionExecution>;
  transactionValidation?: Maybe<TransactionValidation>;
  transactionValidations: Array<TransactionValidation>;
  transactions: Array<Transaction>;
  validator?: Maybe<Validator>;
  validators: Array<Validator>;
  xdaitransaction?: Maybe<XdaiTransaction>;
  xdaitransactions: Array<XdaiTransaction>;
};


export type Query_MetaArgs = {
  block?: InputMaybe<Block_Height>;
};


export type QueryAmbtransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryAmbtransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<AmbTransaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<AmbTransaction_Filter>;
};


export type QueryTransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTransactionExecutionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTransactionExecutionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TransactionExecution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TransactionExecution_Filter>;
};


export type QueryTransactionValidationArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryTransactionValidationsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TransactionValidation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<TransactionValidation_Filter>;
};


export type QueryTransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Transaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Transaction_Filter>;
};


export type QueryValidatorArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryValidatorsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<Validator_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<Validator_Filter>;
};


export type QueryXdaitransactionArgs = {
  block?: InputMaybe<Block_Height>;
  id: Scalars['ID']['input'];
  subgraphError?: _SubgraphErrorPolicy_;
};


export type QueryXdaitransactionsArgs = {
  block?: InputMaybe<Block_Height>;
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<XdaiTransaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  subgraphError?: _SubgraphErrorPolicy_;
  where?: InputMaybe<XdaiTransaction_Filter>;
};

export type Transaction = {
  bridgeName?: Maybe<Scalars['String']['output']>;
  execution?: Maybe<TransactionExecution>;
  id: Scalars['ID']['output'];
  initiator?: Maybe<Scalars['Bytes']['output']>;
  initiatorAmount?: Maybe<Scalars['BigInt']['output']>;
  initiatorNetwork?: Maybe<Scalars['String']['output']>;
  initiatorToken?: Maybe<Scalars['Bytes']['output']>;
  messageId?: Maybe<Scalars['Bytes']['output']>;
  receiver?: Maybe<Scalars['Bytes']['output']>;
  receiverAmount?: Maybe<Scalars['BigInt']['output']>;
  receiverNetwork?: Maybe<Scalars['String']['output']>;
  receiverToken?: Maybe<Scalars['Bytes']['output']>;
  timestamp?: Maybe<Scalars['BigInt']['output']>;
  transactionHash?: Maybe<Scalars['Bytes']['output']>;
  transactionStatus?: Maybe<TransactionStatus>;
  validations?: Maybe<Array<TransactionValidation>>;
};


export type TransactionValidationsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TransactionValidation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TransactionValidation_Filter>;
};

export type TransactionExecution = {
  __typename?: 'TransactionExecution';
  executor?: Maybe<Validator>;
  id: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
  transaction: Transaction;
  transactionHash: Scalars['Bytes']['output'];
  validatorAddr?: Maybe<Scalars['Bytes']['output']>;
};

export type TransactionExecution_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TransactionExecution_Filter>>>;
  executor?: InputMaybe<Scalars['String']['input']>;
  executor_?: InputMaybe<Validator_Filter>;
  executor_contains?: InputMaybe<Scalars['String']['input']>;
  executor_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  executor_ends_with?: InputMaybe<Scalars['String']['input']>;
  executor_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  executor_gt?: InputMaybe<Scalars['String']['input']>;
  executor_gte?: InputMaybe<Scalars['String']['input']>;
  executor_in?: InputMaybe<Array<Scalars['String']['input']>>;
  executor_lt?: InputMaybe<Scalars['String']['input']>;
  executor_lte?: InputMaybe<Scalars['String']['input']>;
  executor_not?: InputMaybe<Scalars['String']['input']>;
  executor_not_contains?: InputMaybe<Scalars['String']['input']>;
  executor_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  executor_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  executor_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  executor_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  executor_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  executor_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  executor_starts_with?: InputMaybe<Scalars['String']['input']>;
  executor_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TransactionExecution_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transaction?: InputMaybe<Scalars['String']['input']>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_gt?: InputMaybe<Scalars['String']['input']>;
  transaction_gte?: InputMaybe<Scalars['String']['input']>;
  transaction_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_lt?: InputMaybe<Scalars['String']['input']>;
  transaction_lte?: InputMaybe<Scalars['String']['input']>;
  transaction_not?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  validatorAddr?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_contains?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_gt?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_gte?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  validatorAddr_lt?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_lte?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_not?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
};

export enum TransactionExecution_OrderBy {
  Executor = 'executor',
  ExecutorAddress = 'executor__address',
  ExecutorBridgeType = 'executor__bridgeType',
  ExecutorHashAdded = 'executor__hashAdded',
  ExecutorHashRemoved = 'executor__hashRemoved',
  ExecutorId = 'executor__id',
  ExecutorLastActivity = 'executor__lastActivity',
  ExecutorName = 'executor__name',
  ExecutorRemoved = 'executor__removed',
  Id = 'id',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
  TransactionHash = 'transactionHash',
  TransactionBridgeName = 'transaction__bridgeName',
  TransactionId = 'transaction__id',
  TransactionInitiator = 'transaction__initiator',
  TransactionInitiatorAmount = 'transaction__initiatorAmount',
  TransactionInitiatorNetwork = 'transaction__initiatorNetwork',
  TransactionInitiatorToken = 'transaction__initiatorToken',
  TransactionMessageId = 'transaction__messageId',
  TransactionReceiver = 'transaction__receiver',
  TransactionReceiverAmount = 'transaction__receiverAmount',
  TransactionReceiverNetwork = 'transaction__receiverNetwork',
  TransactionReceiverToken = 'transaction__receiverToken',
  TransactionTimestamp = 'transaction__timestamp',
  TransactionTransactionHash = 'transaction__transactionHash',
  TransactionTransactionStatus = 'transaction__transactionStatus',
  ValidatorAddr = 'validatorAddr'
}

export enum TransactionStatus {
  Collecting = 'COLLECTING',
  Completed = 'COMPLETED',
  Error = 'ERROR',
  Initiated = 'INITIATED',
  Unclaimed = 'UNCLAIMED'
}

export type TransactionValidation = {
  __typename?: 'TransactionValidation';
  id: Scalars['ID']['output'];
  timestamp: Scalars['BigInt']['output'];
  transaction: Transaction;
  transactionHash?: Maybe<Scalars['Bytes']['output']>;
  validator: Validator;
  validatorAddr?: Maybe<Scalars['Bytes']['output']>;
};

export type TransactionValidation_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<TransactionValidation_Filter>>>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  or?: InputMaybe<Array<InputMaybe<TransactionValidation_Filter>>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transaction?: InputMaybe<Scalars['String']['input']>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transaction_?: InputMaybe<Transaction_Filter>;
  transaction_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_gt?: InputMaybe<Scalars['String']['input']>;
  transaction_gte?: InputMaybe<Scalars['String']['input']>;
  transaction_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_lt?: InputMaybe<Scalars['String']['input']>;
  transaction_lte?: InputMaybe<Scalars['String']['input']>;
  transaction_not?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains?: InputMaybe<Scalars['String']['input']>;
  transaction_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  transaction_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with?: InputMaybe<Scalars['String']['input']>;
  transaction_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  validator?: InputMaybe<Scalars['String']['input']>;
  validatorAddr?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_contains?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_gt?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_gte?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  validatorAddr_lt?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_lte?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_not?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  validatorAddr_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  validator_?: InputMaybe<Validator_Filter>;
  validator_contains?: InputMaybe<Scalars['String']['input']>;
  validator_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validator_ends_with?: InputMaybe<Scalars['String']['input']>;
  validator_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  validator_gt?: InputMaybe<Scalars['String']['input']>;
  validator_gte?: InputMaybe<Scalars['String']['input']>;
  validator_in?: InputMaybe<Array<Scalars['String']['input']>>;
  validator_lt?: InputMaybe<Scalars['String']['input']>;
  validator_lte?: InputMaybe<Scalars['String']['input']>;
  validator_not?: InputMaybe<Scalars['String']['input']>;
  validator_not_contains?: InputMaybe<Scalars['String']['input']>;
  validator_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  validator_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  validator_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  validator_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  validator_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  validator_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  validator_starts_with?: InputMaybe<Scalars['String']['input']>;
  validator_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
};

export enum TransactionValidation_OrderBy {
  Id = 'id',
  Timestamp = 'timestamp',
  Transaction = 'transaction',
  TransactionHash = 'transactionHash',
  TransactionBridgeName = 'transaction__bridgeName',
  TransactionId = 'transaction__id',
  TransactionInitiator = 'transaction__initiator',
  TransactionInitiatorAmount = 'transaction__initiatorAmount',
  TransactionInitiatorNetwork = 'transaction__initiatorNetwork',
  TransactionInitiatorToken = 'transaction__initiatorToken',
  TransactionMessageId = 'transaction__messageId',
  TransactionReceiver = 'transaction__receiver',
  TransactionReceiverAmount = 'transaction__receiverAmount',
  TransactionReceiverNetwork = 'transaction__receiverNetwork',
  TransactionReceiverToken = 'transaction__receiverToken',
  TransactionTimestamp = 'transaction__timestamp',
  TransactionTransactionHash = 'transaction__transactionHash',
  TransactionTransactionStatus = 'transaction__transactionStatus',
  Validator = 'validator',
  ValidatorAddr = 'validatorAddr',
  ValidatorAddress = 'validator__address',
  ValidatorBridgeType = 'validator__bridgeType',
  ValidatorHashAdded = 'validator__hashAdded',
  ValidatorHashRemoved = 'validator__hashRemoved',
  ValidatorId = 'validator__id',
  ValidatorLastActivity = 'validator__lastActivity',
  ValidatorName = 'validator__name',
  ValidatorRemoved = 'validator__removed'
}

export type Transaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  bridgeName?: InputMaybe<Scalars['String']['input']>;
  bridgeName_contains?: InputMaybe<Scalars['String']['input']>;
  bridgeName_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_ends_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeName_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeName_in?: InputMaybe<Array<Scalars['String']['input']>>;
  bridgeName_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeName_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_contains?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  bridgeName_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_starts_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution?: InputMaybe<Scalars['String']['input']>;
  execution_?: InputMaybe<TransactionExecution_Filter>;
  execution_contains?: InputMaybe<Scalars['String']['input']>;
  execution_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_ends_with?: InputMaybe<Scalars['String']['input']>;
  execution_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_gt?: InputMaybe<Scalars['String']['input']>;
  execution_gte?: InputMaybe<Scalars['String']['input']>;
  execution_in?: InputMaybe<Array<Scalars['String']['input']>>;
  execution_lt?: InputMaybe<Scalars['String']['input']>;
  execution_lte?: InputMaybe<Scalars['String']['input']>;
  execution_not?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  execution_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  execution_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  execution_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_starts_with?: InputMaybe<Scalars['String']['input']>;
  execution_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  initiator?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorAmount?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  initiatorAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  initiatorNetwork?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_ends_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initiatorNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initiatorNetwork_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_starts_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorToken?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiatorToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  messageId?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  messageId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<Transaction_Filter>>>;
  receiver?: InputMaybe<Scalars['Bytes']['input']>;
  receiverAmount?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  receiverAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  receiverNetwork?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_ends_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  receiverNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  receiverNetwork_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_starts_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverToken?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiverToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiver_lt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionStatus?: InputMaybe<TransactionStatus>;
  transactionStatus_in?: InputMaybe<Array<TransactionStatus>>;
  transactionStatus_not?: InputMaybe<TransactionStatus>;
  transactionStatus_not_in?: InputMaybe<Array<TransactionStatus>>;
  validations_?: InputMaybe<TransactionValidation_Filter>;
};

export enum Transaction_OrderBy {
  BridgeName = 'bridgeName',
  Execution = 'execution',
  ExecutionId = 'execution__id',
  ExecutionTimestamp = 'execution__timestamp',
  ExecutionTransactionHash = 'execution__transactionHash',
  ExecutionValidatorAddr = 'execution__validatorAddr',
  Id = 'id',
  Initiator = 'initiator',
  InitiatorAmount = 'initiatorAmount',
  InitiatorNetwork = 'initiatorNetwork',
  InitiatorToken = 'initiatorToken',
  MessageId = 'messageId',
  Receiver = 'receiver',
  ReceiverAmount = 'receiverAmount',
  ReceiverNetwork = 'receiverNetwork',
  ReceiverToken = 'receiverToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionStatus = 'transactionStatus',
  Validations = 'validations'
}

export type Validator = {
  __typename?: 'Validator';
  address: Scalars['Bytes']['output'];
  bridgeType?: Maybe<BridgeType>;
  executed: Array<TransactionExecution>;
  hashAdded: Scalars['String']['output'];
  hashRemoved?: Maybe<Scalars['String']['output']>;
  id: Scalars['ID']['output'];
  lastActivity?: Maybe<Scalars['BigInt']['output']>;
  name?: Maybe<Scalars['String']['output']>;
  removed?: Maybe<Scalars['Boolean']['output']>;
  signed: Array<TransactionValidation>;
};


export type ValidatorExecutedArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TransactionExecution_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TransactionExecution_Filter>;
};


export type ValidatorSignedArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TransactionValidation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TransactionValidation_Filter>;
};

export type Validator_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  address?: InputMaybe<Scalars['Bytes']['input']>;
  address_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_gt?: InputMaybe<Scalars['Bytes']['input']>;
  address_gte?: InputMaybe<Scalars['Bytes']['input']>;
  address_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  address_lt?: InputMaybe<Scalars['Bytes']['input']>;
  address_lte?: InputMaybe<Scalars['Bytes']['input']>;
  address_not?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  address_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  and?: InputMaybe<Array<InputMaybe<Validator_Filter>>>;
  bridgeType?: InputMaybe<BridgeType>;
  bridgeType_in?: InputMaybe<Array<BridgeType>>;
  bridgeType_not?: InputMaybe<BridgeType>;
  bridgeType_not_in?: InputMaybe<Array<BridgeType>>;
  executed_?: InputMaybe<TransactionExecution_Filter>;
  hashAdded?: InputMaybe<Scalars['String']['input']>;
  hashAdded_contains?: InputMaybe<Scalars['String']['input']>;
  hashAdded_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  hashAdded_ends_with?: InputMaybe<Scalars['String']['input']>;
  hashAdded_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  hashAdded_gt?: InputMaybe<Scalars['String']['input']>;
  hashAdded_gte?: InputMaybe<Scalars['String']['input']>;
  hashAdded_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hashAdded_lt?: InputMaybe<Scalars['String']['input']>;
  hashAdded_lte?: InputMaybe<Scalars['String']['input']>;
  hashAdded_not?: InputMaybe<Scalars['String']['input']>;
  hashAdded_not_contains?: InputMaybe<Scalars['String']['input']>;
  hashAdded_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  hashAdded_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  hashAdded_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  hashAdded_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hashAdded_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  hashAdded_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  hashAdded_starts_with?: InputMaybe<Scalars['String']['input']>;
  hashAdded_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  hashRemoved?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_contains?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_ends_with?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_gt?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_gte?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hashRemoved_lt?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_lte?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_not?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_not_contains?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  hashRemoved_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_starts_with?: InputMaybe<Scalars['String']['input']>;
  hashRemoved_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  lastActivity?: InputMaybe<Scalars['BigInt']['input']>;
  lastActivity_gt?: InputMaybe<Scalars['BigInt']['input']>;
  lastActivity_gte?: InputMaybe<Scalars['BigInt']['input']>;
  lastActivity_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  lastActivity_lt?: InputMaybe<Scalars['BigInt']['input']>;
  lastActivity_lte?: InputMaybe<Scalars['BigInt']['input']>;
  lastActivity_not?: InputMaybe<Scalars['BigInt']['input']>;
  lastActivity_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  name?: InputMaybe<Scalars['String']['input']>;
  name_contains?: InputMaybe<Scalars['String']['input']>;
  name_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_gt?: InputMaybe<Scalars['String']['input']>;
  name_gte?: InputMaybe<Scalars['String']['input']>;
  name_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_lt?: InputMaybe<Scalars['String']['input']>;
  name_lte?: InputMaybe<Scalars['String']['input']>;
  name_not?: InputMaybe<Scalars['String']['input']>;
  name_not_contains?: InputMaybe<Scalars['String']['input']>;
  name_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  name_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  name_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  name_starts_with?: InputMaybe<Scalars['String']['input']>;
  name_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  or?: InputMaybe<Array<InputMaybe<Validator_Filter>>>;
  removed?: InputMaybe<Scalars['Boolean']['input']>;
  removed_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  removed_not?: InputMaybe<Scalars['Boolean']['input']>;
  removed_not_in?: InputMaybe<Array<Scalars['Boolean']['input']>>;
  signed_?: InputMaybe<TransactionValidation_Filter>;
};

export enum Validator_OrderBy {
  Address = 'address',
  BridgeType = 'bridgeType',
  Executed = 'executed',
  HashAdded = 'hashAdded',
  HashRemoved = 'hashRemoved',
  Id = 'id',
  LastActivity = 'lastActivity',
  Name = 'name',
  Removed = 'removed',
  Signed = 'signed'
}

export type XdaiTransaction = Transaction & {
  __typename?: 'XDAITransaction';
  bridgeName?: Maybe<Scalars['String']['output']>;
  execution?: Maybe<TransactionExecution>;
  id: Scalars['ID']['output'];
  initiator?: Maybe<Scalars['Bytes']['output']>;
  initiatorAmount?: Maybe<Scalars['BigInt']['output']>;
  initiatorNetwork?: Maybe<Scalars['String']['output']>;
  initiatorToken?: Maybe<Scalars['Bytes']['output']>;
  messageId?: Maybe<Scalars['Bytes']['output']>;
  nonce?: Maybe<Scalars['Bytes']['output']>;
  receiver?: Maybe<Scalars['Bytes']['output']>;
  receiverAmount?: Maybe<Scalars['BigInt']['output']>;
  receiverNetwork?: Maybe<Scalars['String']['output']>;
  receiverToken?: Maybe<Scalars['Bytes']['output']>;
  timestamp?: Maybe<Scalars['BigInt']['output']>;
  transactionHash?: Maybe<Scalars['Bytes']['output']>;
  transactionStatus?: Maybe<TransactionStatus>;
  validations?: Maybe<Array<TransactionValidation>>;
};


export type XdaiTransactionValidationsArgs = {
  first?: InputMaybe<Scalars['Int']['input']>;
  orderBy?: InputMaybe<TransactionValidation_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  skip?: InputMaybe<Scalars['Int']['input']>;
  where?: InputMaybe<TransactionValidation_Filter>;
};

export type XdaiTransaction_Filter = {
  /** Filter for the block changed event. */
  _change_block?: InputMaybe<BlockChangedFilter>;
  and?: InputMaybe<Array<InputMaybe<XdaiTransaction_Filter>>>;
  bridgeName?: InputMaybe<Scalars['String']['input']>;
  bridgeName_contains?: InputMaybe<Scalars['String']['input']>;
  bridgeName_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_ends_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_gt?: InputMaybe<Scalars['String']['input']>;
  bridgeName_gte?: InputMaybe<Scalars['String']['input']>;
  bridgeName_in?: InputMaybe<Array<Scalars['String']['input']>>;
  bridgeName_lt?: InputMaybe<Scalars['String']['input']>;
  bridgeName_lte?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_contains?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  bridgeName_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  bridgeName_starts_with?: InputMaybe<Scalars['String']['input']>;
  bridgeName_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution?: InputMaybe<Scalars['String']['input']>;
  execution_?: InputMaybe<TransactionExecution_Filter>;
  execution_contains?: InputMaybe<Scalars['String']['input']>;
  execution_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_ends_with?: InputMaybe<Scalars['String']['input']>;
  execution_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_gt?: InputMaybe<Scalars['String']['input']>;
  execution_gte?: InputMaybe<Scalars['String']['input']>;
  execution_in?: InputMaybe<Array<Scalars['String']['input']>>;
  execution_lt?: InputMaybe<Scalars['String']['input']>;
  execution_lte?: InputMaybe<Scalars['String']['input']>;
  execution_not?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains?: InputMaybe<Scalars['String']['input']>;
  execution_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  execution_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  execution_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  execution_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  execution_starts_with?: InputMaybe<Scalars['String']['input']>;
  execution_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  id?: InputMaybe<Scalars['ID']['input']>;
  id_gt?: InputMaybe<Scalars['ID']['input']>;
  id_gte?: InputMaybe<Scalars['ID']['input']>;
  id_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  id_lt?: InputMaybe<Scalars['ID']['input']>;
  id_lte?: InputMaybe<Scalars['ID']['input']>;
  id_not?: InputMaybe<Scalars['ID']['input']>;
  id_not_in?: InputMaybe<Array<Scalars['ID']['input']>>;
  initiator?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorAmount?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  initiatorAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  initiatorAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  initiatorNetwork?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_ends_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initiatorNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  initiatorNetwork_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_starts_with?: InputMaybe<Scalars['String']['input']>;
  initiatorNetwork_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  initiatorToken?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiatorToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiatorToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiator_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_gt?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_gte?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  initiator_lt?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_lte?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  initiator_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  messageId?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_contains?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_gt?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_gte?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  messageId_lt?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_lte?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  messageId_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  nonce?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_contains?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_gt?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_gte?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  nonce_lt?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_lte?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_not?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  nonce_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  or?: InputMaybe<Array<InputMaybe<XdaiTransaction_Filter>>>;
  receiver?: InputMaybe<Scalars['Bytes']['input']>;
  receiverAmount?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_gt?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_gte?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  receiverAmount_lt?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_lte?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_not?: InputMaybe<Scalars['BigInt']['input']>;
  receiverAmount_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  receiverNetwork?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_contains?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_ends_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_gt?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_gte?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_in?: InputMaybe<Array<Scalars['String']['input']>>;
  receiverNetwork_lt?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_lte?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_contains?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_contains_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_ends_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_ends_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_in?: InputMaybe<Array<Scalars['String']['input']>>;
  receiverNetwork_not_starts_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_not_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_starts_with?: InputMaybe<Scalars['String']['input']>;
  receiverNetwork_starts_with_nocase?: InputMaybe<Scalars['String']['input']>;
  receiverToken?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_gt?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_gte?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiverToken_lt?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_lte?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiverToken_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiver_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_gte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  receiver_lt?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_lte?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  receiver_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  timestamp?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_gte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  timestamp_lt?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_lte?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not?: InputMaybe<Scalars['BigInt']['input']>;
  timestamp_not_in?: InputMaybe<Array<Scalars['BigInt']['input']>>;
  transactionHash?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_gte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionHash_lt?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_lte?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_contains?: InputMaybe<Scalars['Bytes']['input']>;
  transactionHash_not_in?: InputMaybe<Array<Scalars['Bytes']['input']>>;
  transactionStatus?: InputMaybe<TransactionStatus>;
  transactionStatus_in?: InputMaybe<Array<TransactionStatus>>;
  transactionStatus_not?: InputMaybe<TransactionStatus>;
  transactionStatus_not_in?: InputMaybe<Array<TransactionStatus>>;
  validations_?: InputMaybe<TransactionValidation_Filter>;
};

export enum XdaiTransaction_OrderBy {
  BridgeName = 'bridgeName',
  Execution = 'execution',
  ExecutionId = 'execution__id',
  ExecutionTimestamp = 'execution__timestamp',
  ExecutionTransactionHash = 'execution__transactionHash',
  ExecutionValidatorAddr = 'execution__validatorAddr',
  Id = 'id',
  Initiator = 'initiator',
  InitiatorAmount = 'initiatorAmount',
  InitiatorNetwork = 'initiatorNetwork',
  InitiatorToken = 'initiatorToken',
  MessageId = 'messageId',
  Nonce = 'nonce',
  Receiver = 'receiver',
  ReceiverAmount = 'receiverAmount',
  ReceiverNetwork = 'receiverNetwork',
  ReceiverToken = 'receiverToken',
  Timestamp = 'timestamp',
  TransactionHash = 'transactionHash',
  TransactionStatus = 'transactionStatus',
  Validations = 'validations'
}

export type _Block_ = {
  __typename?: '_Block_';
  /** The hash of the block */
  hash?: Maybe<Scalars['Bytes']['output']>;
  /** The block number */
  number: Scalars['Int']['output'];
  /** The hash of the parent block */
  parentHash?: Maybe<Scalars['Bytes']['output']>;
  /** Integer representation of the timestamp stored in blocks for the chain */
  timestamp?: Maybe<Scalars['Int']['output']>;
};

/** The type for the top-level _meta field */
export type _Meta_ = {
  __typename?: '_Meta_';
  /**
   * Information about a specific subgraph block. The hash of the block
   * will be null if the _meta field has a block constraint that asks for
   * a block number. It will be filled if the _meta field has no block constraint
   * and therefore asks for the latest  block
   *
   */
  block: _Block_;
  /** The deployment ID */
  deployment: Scalars['String']['output'];
  /** If `true`, the subgraph encountered indexing errors at some past block */
  hasIndexingErrors: Scalars['Boolean']['output'];
};

export enum _SubgraphErrorPolicy_ {
  /** Data will be returned even if the subgraph has indexing errors */
  Allow = 'allow',
  /** If the subgraph has indexing errors, data will be omitted. The default. */
  Deny = 'deny'
}

type TransactionFragment_AmbTransaction_Fragment = { __typename?: 'AMBTransaction', id: string, bridgeName?: string | null, transactionHash?: any | null, initiator?: any | null, initiatorAmount?: any | null, initiatorNetwork?: string | null, initiatorToken?: any | null, receiver?: any | null, receiverToken?: any | null, receiverAmount?: any | null, receiverNetwork?: string | null, transactionStatus?: TransactionStatus | null, timestamp?: any | null, execution?: { __typename?: 'TransactionExecution', id: string, timestamp: any, transactionHash: any, validatorAddr?: any | null } | null, validations?: Array<{ __typename?: 'TransactionValidation', id: string, timestamp: any, transactionHash?: any | null, validatorAddr?: any | null }> | null };

type TransactionFragment_XdaiTransaction_Fragment = { __typename?: 'XDAITransaction', id: string, bridgeName?: string | null, transactionHash?: any | null, initiator?: any | null, initiatorAmount?: any | null, initiatorNetwork?: string | null, initiatorToken?: any | null, receiver?: any | null, receiverToken?: any | null, receiverAmount?: any | null, receiverNetwork?: string | null, transactionStatus?: TransactionStatus | null, timestamp?: any | null, execution?: { __typename?: 'TransactionExecution', id: string, timestamp: any, transactionHash: any, validatorAddr?: any | null } | null, validations?: Array<{ __typename?: 'TransactionValidation', id: string, timestamp: any, transactionHash?: any | null, validatorAddr?: any | null }> | null };

export type TransactionFragmentFragment = TransactionFragment_AmbTransaction_Fragment | TransactionFragment_XdaiTransaction_Fragment;

export type TransactionsQueryVariables = Exact<{
  where?: InputMaybe<Transaction_Filter>;
  orderBy?: InputMaybe<Transaction_OrderBy>;
  orderDirection?: InputMaybe<OrderDirection>;
  first?: InputMaybe<Scalars['Int']['input']>;
  skip?: InputMaybe<Scalars['Int']['input']>;
}>;


export type TransactionsQuery = { __typename?: 'Query', transactions: Array<{ __typename?: 'AMBTransaction', id: string, bridgeName?: string | null, transactionHash?: any | null, initiator?: any | null, initiatorAmount?: any | null, initiatorNetwork?: string | null, initiatorToken?: any | null, receiver?: any | null, receiverToken?: any | null, receiverAmount?: any | null, receiverNetwork?: string | null, transactionStatus?: TransactionStatus | null, timestamp?: any | null, execution?: { __typename?: 'TransactionExecution', id: string, timestamp: any, transactionHash: any, validatorAddr?: any | null } | null, validations?: Array<{ __typename?: 'TransactionValidation', id: string, timestamp: any, transactionHash?: any | null, validatorAddr?: any | null }> | null } | { __typename?: 'XDAITransaction', id: string, bridgeName?: string | null, transactionHash?: any | null, initiator?: any | null, initiatorAmount?: any | null, initiatorNetwork?: string | null, initiatorToken?: any | null, receiver?: any | null, receiverToken?: any | null, receiverAmount?: any | null, receiverNetwork?: string | null, transactionStatus?: TransactionStatus | null, timestamp?: any | null, execution?: { __typename?: 'TransactionExecution', id: string, timestamp: any, transactionHash: any, validatorAddr?: any | null } | null, validations?: Array<{ __typename?: 'TransactionValidation', id: string, timestamp: any, transactionHash?: any | null, validatorAddr?: any | null }> | null }> };

export type ValidatorsQueryVariables = Exact<{ [key: string]: never; }>;


export type ValidatorsQuery = { __typename?: 'Query', validators: Array<{ __typename?: 'Validator', id: string, name?: string | null, bridgeType?: BridgeType | null, address: any, lastActivity?: any | null, signed: Array<{ __typename?: 'TransactionValidation', id: string }>, executed: Array<{ __typename?: 'TransactionExecution', id: string }> }> };

export const TransactionFragmentFragmentDoc = gql`
    fragment TransactionFragment on Transaction {
  id
  bridgeName
  transactionHash
  initiator
  initiatorAmount
  initiatorNetwork
  initiatorToken
  receiver
  receiverToken
  receiverAmount
  receiverNetwork
  transactionStatus
  timestamp
  execution {
    id
    timestamp
    transactionHash
    validatorAddr
  }
  validations {
    id
    timestamp
    transactionHash
    validatorAddr
  }
}
    `;
export const TransactionsDocument = gql`
    query Transactions($where: Transaction_filter, $orderBy: Transaction_orderBy, $orderDirection: OrderDirection, $first: Int, $skip: Int) {
  transactions(
    where: $where
    orderBy: $orderBy
    orderDirection: $orderDirection
    first: $first
    skip: $skip
  ) {
    ...TransactionFragment
  }
}
    ${TransactionFragmentFragmentDoc}`;
export const ValidatorsDocument = gql`
    query Validators {
  validators(where: {removed: false}) {
    id
    name
    bridgeType
    address
    lastActivity
    signed(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
    }
    executed(orderBy: timestamp, orderDirection: desc, first: 10) {
      id
    }
  }
}
    `;

export type SdkFunctionWrapper = <T>(action: (requestHeaders?:Record<string, string>) => Promise<T>, operationName: string, operationType?: string) => Promise<T>;


const defaultWrapper: SdkFunctionWrapper = (action, _operationName, _operationType) => action();

export function getSdk(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  return {
    Transactions(variables?: TransactionsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<TransactionsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<TransactionsQuery>(TransactionsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Transactions', 'query');
    },
    Validators(variables?: ValidatorsQueryVariables, requestHeaders?: Dom.RequestInit["headers"]): Promise<ValidatorsQuery> {
      return withWrapper((wrappedRequestHeaders) => client.request<ValidatorsQuery>(ValidatorsDocument, variables, {...requestHeaders, ...wrappedRequestHeaders}), 'Validators', 'query');
    }
  };
}
export type Sdk = ReturnType<typeof getSdk>;
export function getSdkWithHooks(client: GraphQLClient, withWrapper: SdkFunctionWrapper = defaultWrapper) {
  const sdk = getSdk(client, withWrapper);
  const genKey = <V extends Record<string, unknown> = Record<string, unknown>>(name: string, object: V = {} as V): SWRKeyInterface => [name, ...Object.keys(object).sort().map(key => object[key])];
  return {
    ...sdk,
    useTransactions(variables?: TransactionsQueryVariables, config?: SWRConfigInterface<TransactionsQuery, ClientError>) {
      return useSWR<TransactionsQuery, ClientError>(genKey<TransactionsQueryVariables>('Transactions', variables), () => sdk.Transactions(variables), config);
    },
    useValidators(variables?: ValidatorsQueryVariables, config?: SWRConfigInterface<ValidatorsQuery, ClientError>) {
      return useSWR<ValidatorsQuery, ClientError>(genKey<ValidatorsQueryVariables>('Validators', variables), () => sdk.Validators(variables), config);
    }
  };
}
export type SdkWithHooks = ReturnType<typeof getSdkWithHooks>;