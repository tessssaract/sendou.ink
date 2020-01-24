import React from "react"
import { Helmet } from "react-helmet-async"
import { RouteComponentProps } from "@reach/router"
import WeaponSelector from "../common/WeaponSelector"
import { useState } from "react"
import {
  Weapon,
  Ability,
  SearchForBuildsData,
  SearchForBuildsVars,
  Build,
} from "../../types"
import useBreakPoints from "../../hooks/useBreakPoints"
import { abilitiesGameOrder } from "../../utils/lists"
import { Box, Flex, Heading, FormLabel, Switch, Button } from "@chakra-ui/core"
import AbilityIcon from "./AbilityIcon"
import { useContext } from "react"
import MyThemeContext from "../../themeContext"
import useLocalStorage from "@rehooks/local-storage"
import { useQuery } from "@apollo/react-hooks"
import { SEARCH_FOR_BUILDS } from "../../graphql/queries/searchForBuilds"
import Loading from "../common/Loading"
import Error from "../common/Error"
import BuildCard from "./BuildCard"
import InfiniteScroll from "react-infinite-scroller"

const BuildsPage: React.FC<RouteComponentProps> = () => {
  const { themeColor } = useContext(MyThemeContext)
  const [weapon, setWeapon] = useState<Weapon | null>(null)
  const [buildsToShow, setBuildsToShow] = useState(4)
  const [abilities, setAbilities] = useState<Ability[]>([])
  const [prefersAPView, setAPPreference] = useLocalStorage<boolean>(
    "prefersAPView"
  )
  const isSmall = useBreakPoints(870)

  const { data, error, loading } = useQuery<
    SearchForBuildsData,
    SearchForBuildsVars
  >(SEARCH_FOR_BUILDS, {
    variables: { weapon: weapon as any },
    skip: !weapon,
  })
  if (error) return <Error errorMessage={error.message} />

  const buildsFilterByAbilities: Build[] = !data
    ? []
    : data.searchForBuilds.filter(build => {
        if (abilities.length === 0) return true
        const abilitiesInBuild = new Set([
          ...build.headgear,
          ...build.clothing,
          ...build.shoes,
        ])
        return abilities.every(ability => abilitiesInBuild.has(ability))
      })

  return (
    <>
      <Helmet>
        <title>{weapon ? `${weapon} ` : ""}Builds | sendou.ink</title>
      </Helmet>
      <Box mb="1em">
        <FormLabel htmlFor="apview">Default to Ability Point view</FormLabel>
        <Switch
          id="apview"
          color={themeColor}
          isChecked={prefersAPView === null ? false : prefersAPView}
          onChange={() => setAPPreference(!prefersAPView)}
        />
      </Box>
      <WeaponSelector
        weapon={weapon}
        setWeapon={(weapon: Weapon | null) => setWeapon(weapon)}
        dropdownMode={isSmall}
      />
      {weapon && (
        <Flex flexWrap="wrap" justifyContent="center" mt="1em">
          {abilitiesGameOrder.map(ability => (
            <Box
              key={ability}
              p="5px"
              cursor={abilities.indexOf(ability) === -1 ? "pointer" : undefined}
              onClick={() => {
                if (abilities.indexOf(ability) !== -1) return
                setAbilities(abilities.concat(ability))
              }}
            >
              <AbilityIcon
                ability={abilities.indexOf(ability) === -1 ? ability : "EMPTY"}
                size="SUB"
              />{" "}
            </Box>
          ))}
        </Flex>
      )}
      {abilities.length > 0 && (
        <>
          <Heading size="sm" mx="auto" width="50%" textAlign="center" pt="1em">
            Only showing builds featuring the following abilities
          </Heading>
          <Flex flexWrap="wrap" justifyContent="center" pt="1em">
            {abilities.map(ability => (
              <Box
                key={ability}
                cursor="pointer"
                p="5px"
                onClick={() =>
                  setAbilities(
                    abilities.filter(
                      abilityInArray => ability !== abilityInArray
                    )
                  )
                }
              >
                <AbilityIcon ability={ability} size="SUB" />{" "}
              </Box>
            ))}
          </Flex>
        </>
      )}
      {loading && <Loading />}
      {buildsFilterByAbilities.length > 0 && data && (
        <>
          <InfiniteScroll
            pageStart={1}
            loadMore={page => setBuildsToShow(page * 4)}
            hasMore={buildsToShow < data.searchForBuilds.length}
          >
            <Flex flexWrap="wrap" pt="2em">
              {buildsFilterByAbilities
                .filter((build, index) => index < buildsToShow)
                .map(build => (
                  <Box key={build.id} p="0.2em">
                    <BuildCard
                      build={build}
                      defaultToAPView={
                        prefersAPView === null ? false : prefersAPView
                      }
                      showUser
                    />
                  </Box>
                ))}
            </Flex>
          </InfiniteScroll>
          <Box w="50%" textAlign="center" mx="auto">
            <Heading size="sm">No more builds to show</Heading>
            <Button
              variantColor={themeColor}
              variant="outline"
              mt="1em"
              onClick={() => window.scrollTo(0, 0)}
            >
              Return to the top
            </Button>
          </Box>
        </>
      )}
    </>
  )
}

export default BuildsPage
