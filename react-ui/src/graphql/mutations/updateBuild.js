import { gql } from "apollo-boost"

export const updateBuild = gql`
  mutation updateBuild(
    $id: ID!
    $weapon: String!
    $title: String
    $description: String
    $headgear: [Ability!]!
    $headgearItem: String
    $clothing: [Ability!]!
    $clothingItem: String
    $shoes: [Ability!]!
    $shoesItem: String
  ) {
    updateBuild(
      id: $id
      weapon: $weapon
      title: $title
      description: $description
      headgear: $headgear
      headgearItem: $headgearItem
      clothing: $clothing
      clothingItem: $clothingItem
      shoes: $shoes
      shoesItem: $shoesItem
    )
  }
`
